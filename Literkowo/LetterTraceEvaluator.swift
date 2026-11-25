import SwiftUI

private struct LetterPointCollection: Decodable {
    let format: String
    let letters: [String: LetterPointModel]
}

private struct LetterPointModel: Decodable {
    let strokes: [LetterPointStroke]
}

private struct LetterPointStroke: Decodable {
    let dots: [[Double]]
    let press: Bool?
    let closed: Bool?
}

private struct LetterPathCollection: Decodable {
    let format: String
    let letters: [String: LetterPathModel]
}

private struct LetterPathModel: Decodable {
    let aspect: Double
    let bounds: LetterBounds
}

private struct LetterBounds: Decodable {
    let minY: Double
    let maxY: Double
}

/// Natywny iOS korzysta z tych samych danych ścieżek i punktów co PWA.
enum LetterTraceTemplate {
    private static let source: (points: LetterPointCollection, paths: LetterPathCollection)? = {
        guard
            let pointsURL = Bundle.main.url(forResource: "letter-points", withExtension: "json"),
            let pathsURL = Bundle.main.url(forResource: "letter-paths", withExtension: "json"),
            let pointsData = try? Data(contentsOf: pointsURL),
            let pathsData = try? Data(contentsOf: pathsURL),
            let points = try? JSONDecoder().decode(LetterPointCollection.self, from: pointsData),
            let paths = try? JSONDecoder().decode(LetterPathCollection.self, from: pathsData),
            points.format == "literkowo-letter-points/1",
            paths.format == "literkowo-strokes/1"
        else {
            return nil
        }
        return (points, paths)
    }()

    /// Zwraca punkty w układzie 0...1, zachowując transformację używaną przez PWA.
    static func strokes(for character: String, canvasSize: CGSize) -> [[CGPoint]] {
        guard
            canvasSize.width > 0,
            canvasSize.height > 0,
            let source,
            let letter = source.points.letters[character],
            let geometry = source.paths.letters[character]
        else {
            return []
        }

        let frameX = -0.05
        let frameY = geometry.bounds.minY - 0.045
        let frameWidth = geometry.aspect + 0.10
        let frameHeight = geometry.bounds.maxY - geometry.bounds.minY + 0.09
        guard frameWidth > 0, frameHeight > 0 else { return [] }

        let scale = min(
            Double(canvasSize.width) * 0.88 / frameWidth,
            Double(canvasSize.height) * 0.84 / frameHeight
        )
        let offsetX = (Double(canvasSize.width) - frameWidth * scale) / 2
        let offsetY = (Double(canvasSize.height) - frameHeight * scale) / 2

        let converted = letter.strokes.map { stroke in
            stroke.dots.compactMap { point -> CGPoint? in
                guard point.count == 2 else { return nil }
                let x = (offsetX + (point[0] - frameX) * scale) / Double(canvasSize.width)
                let y = (offsetY + (point[1] - frameY) * scale) / Double(canvasSize.height)
                return CGPoint(x: x, y: y)
            }
        }

        // Zachowujemy natywną, dwuruchową wersję wielkiego A:
        // dół-lewo → szczyt → dół-prawo, a następnie poprzeczka.
        if character == "A", converted.count >= 3 {
            let joined = Array(converted[0].reversed()) + Array(converted[1].dropFirst())
            return [joined] + Array(converted.dropFirst(2))
        }
        return converted
    }
}

struct LetterTraceEvaluation {
    let isAccepted: Bool
    let score: CGFloat
    let message: String
}

enum LetterTraceEvaluator {
    static func evaluate(userStrokes: [[CGPoint]], templateStrokes: [[CGPoint]], canvasSize: CGSize) -> LetterTraceEvaluation {
        guard canvasSize.width > 0, canvasSize.height > 0, !templateStrokes.isEmpty else {
            return LetterTraceEvaluation(isAccepted: false, score: 1, message: "Nie można ocenić tego wzoru. Sprawdź, czy dane liter zostały załadowane.")
        }
        guard userStrokes.count == templateStrokes.count else {
            return LetterTraceEvaluation(isAccepted: false, score: 1, message: "Liczba ruchów jest inna niż we wzorze. Sprawdź numerację i spróbuj ponownie.")
        }

        var total: CGFloat = 0
        for (user, template) in zip(userStrokes, templateStrokes) {
            guard !user.isEmpty, !template.isEmpty else {
                return LetterTraceEvaluation(isAccepted: false, score: 1, message: "Wykonaj każdy ruch zgodnie z podpowiedzią.")
            }

            let normalizedUser = user.map { CGPoint(x: $0.x / canvasSize.width, y: $0.y / canvasSize.height) }

            // Kropki nad i, j oraz ż są pojedynczym dotknięciem, a nie kreską.
            if template.count == 1 {
                let nearest = normalizedUser.map { distance($0, template[0]) }.min() ?? 1
                guard nearest <= 0.06 else {
                    return LetterTraceEvaluation(isAccepted: false, score: nearest, message: "Dotknij pomarańczowego punktu, aby postawić znak.")
                }
                total += nearest
                continue
            }

            guard user.count >= 4, template.count >= 2 else {
                return LetterTraceEvaluation(isAccepted: false, score: 1, message: "Dokończ każdy ruch jednym płynnym pociągnięciem.")
            }
            let a = resample(normalizedUser, count: 32)
            let b = resample(template, count: 32)
            let meanDistance = zip(a, b).reduce(CGFloat.zero) { partial, pair in
                partial + distance(pair.0, pair.1)
            } / CGFloat(a.count)
            let startError = distance(a[0], b[0])
            let endError = distance(a[a.count - 1], b[b.count - 1])
            total += meanDistance * 0.70 + (startError + endError) * 0.15
        }

        let score = total / CGFloat(templateStrokes.count)
        let accepted = score <= 0.19
        let message = accepted
            ? "Świetnie! Kierunek i kolejność ruchów pasują do wzoru."
            : "Spróbuj bliżej jasnej linii. Zwróć uwagę na punkt startu i kierunek strzałki."
        return LetterTraceEvaluation(isAccepted: accepted, score: score, message: message)
    }

    private static func distance(_ a: CGPoint, _ b: CGPoint) -> CGFloat {
        let dx = a.x - b.x
        let dy = a.y - b.y
        return sqrt(dx * dx + dy * dy)
    }

    private static func resample(_ points: [CGPoint], count: Int) -> [CGPoint] {
        guard points.count > 1, count > 1 else { return points }
        var lengths: [CGFloat] = [0]
        for pair in zip(points, points.dropFirst()) {
            lengths.append(lengths.last! + distance(pair.0, pair.1))
        }
        let total = lengths.last ?? 0
        guard total > 0 else { return Array(repeating: points[0], count: count) }
        var result: [CGPoint] = []
        var segment = 1
        for index in 0..<count {
            let target = total * CGFloat(index) / CGFloat(count - 1)
            while segment < lengths.count - 1 && lengths[segment] < target { segment += 1 }
            let startLength = lengths[segment - 1]
            let segmentLength = max(lengths[segment] - startLength, 0.000001)
            let t = min(max((target - startLength) / segmentLength, 0), 1)
            let start = points[segment - 1]
            let end = points[segment]
            result.append(CGPoint(x: start.x + (end.x - start.x) * t, y: start.y + (end.y - start.y) * t))
        }
        return result
    }
}
