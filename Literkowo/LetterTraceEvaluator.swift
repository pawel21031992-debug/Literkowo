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

    static func isClosed(_ character: String, stroke index: Int) -> Bool {
        source?.points.letters[character]?.strokes.indices.contains(index) == true
            ? (source?.points.letters[character]?.strokes[index].closed ?? false)
            : false
    }

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
            var points = stroke.dots.compactMap { point -> CGPoint? in
                guard point.count == 2 else { return nil }
                let x = (offsetX + (point[0] - frameX) * scale) / Double(canvasSize.width)
                let y = (offsetY + (point[1] - frameY) * scale) / Double(canvasSize.height)
                return CGPoint(x: x, y: y)
            }
            if stroke.closed == true, points.count > 1, let first = points.first {
                points.append(first)
            }
            return points
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
    private struct StrokeResult {
        let pass: Bool
        let coverage: CGFloat
        let average: CGFloat
        let error: CGFloat
    }

    static func evaluate(userStrokes: [[CGPoint]], templateStrokes: [[CGPoint]], canvasSize: CGSize) -> LetterTraceEvaluation {
        guard canvasSize.width > 0, canvasSize.height > 0, !templateStrokes.isEmpty else {
            return LetterTraceEvaluation(isAccepted: false, score: 1, message: "Nie można ocenić wzoru. Sprawdź, czy dane liter zostały załadowane.")
        }
        guard !userStrokes.isEmpty else {
            return LetterTraceEvaluation(isAccepted: false, score: 1, message: "Zacznij od pierwszego pomarańczowego punktu.")
        }
        guard userStrokes.count <= templateStrokes.count else {
            return LetterTraceEvaluation(isAccepted: false, score: 1, message: "Wykonano za dużo ruchów. Wyczyść pole i zacznij ponownie.")
        }

        let tolerance = max(14, min(20, min(canvasSize.width, canvasSize.height) * 0.055))
        var totalError: CGFloat = 0

        for index in userStrokes.indices {
            let user = userStrokes[index]
            let template = templateStrokes[index].map {
                CGPoint(x: $0.x * canvasSize.width, y: $0.y * canvasSize.height)
            }
            guard !user.isEmpty, !template.isEmpty else {
                return LetterTraceEvaluation(isAccepted: false, score: 1, message: "Wykonaj każdy ruch zgodnie z podpowiedzią.")
            }

            let closed = false // Wariant zamknięty jest sprawdzany przez flagę wzoru w overloadzie poniżej.
            let result = bestScore(user: user, expected: template, tolerance: tolerance, closed: closed)
            guard result.pass else {
                let message = template.count == 1
                    ? "Dotknij pomarańczowego punktu, aby postawić znak."
                    : "Spróbuj ponownie. Zacznij przy pomarańczowym punkcie i prowadź palec po wzorze we właściwym kierunku."
                return LetterTraceEvaluation(isAccepted: false, score: result.error, message: message)
            }
            totalError += result.error
        }

        let score = totalError / CGFloat(max(1, userStrokes.count))
        let accepted = userStrokes.count == templateStrokes.count
        let message = accepted
            ? "Świetnie! Ruchy pasują do wzoru. Możesz zapisać ćwiczenie."
            : "Dobrze! Teraz wykonaj kolejny ruch zgodnie z numeracją."
        return LetterTraceEvaluation(isAccepted: accepted, score: score, message: message)
    }

    static func evaluate(userStrokes: [[CGPoint]], templateStrokes: [[CGPoint]], canvasSize: CGSize, character: String) -> LetterTraceEvaluation {
        guard canvasSize.width > 0, canvasSize.height > 0, !templateStrokes.isEmpty else {
            return LetterTraceEvaluation(isAccepted: false, score: 1, message: "Nie można ocenić wzoru. Sprawdź, czy dane liter zostały załadowane.")
        }
        guard !userStrokes.isEmpty else {
            return LetterTraceEvaluation(isAccepted: false, score: 1, message: "Zacznij od pierwszego pomarańczowego punktu.")
        }
        guard userStrokes.count <= templateStrokes.count else {
            return LetterTraceEvaluation(isAccepted: false, score: 1, message: "Wykonano za dużo ruchów. Wyczyść pole i zacznij ponownie.")
        }

        let tolerance = max(14, min(20, min(canvasSize.width, canvasSize.height) * 0.055))
        var totalError: CGFloat = 0
        for index in userStrokes.indices {
            let user = userStrokes[index]
            let expected = templateStrokes[index].map {
                CGPoint(x: $0.x * canvasSize.width, y: $0.y * canvasSize.height)
            }
            guard !user.isEmpty, !expected.isEmpty else {
                return LetterTraceEvaluation(isAccepted: false, score: 1, message: "Wykonaj każdy ruch zgodnie z podpowiedzią.")
            }
            let closed = LetterTraceTemplate.isClosed(character, stroke: index)
            let result = bestScore(user: user, expected: expected, tolerance: tolerance, closed: closed)
            guard result.pass else {
                let message = expected.count == 1
                    ? "Dotknij pomarańczowego punktu, aby postawić znak."
                    : "Spróbuj ponownie. Zacznij przy pomarańczowym punkcie i prowadź palec po wzorze we właściwym kierunku."
                return LetterTraceEvaluation(isAccepted: false, score: result.error, message: message)
            }
            totalError += result.error
        }
        let score = totalError / CGFloat(max(1, userStrokes.count))
        let accepted = userStrokes.count == templateStrokes.count
        return LetterTraceEvaluation(
            isAccepted: accepted,
            score: score,
            message: accepted
                ? "Świetnie! Ruchy pasują do wzoru. Możesz zapisać ćwiczenie."
                : "Dobrze! Teraz wykonaj kolejny ruch zgodnie z numeracją."
        )
    }

    static func isStrokeValid(user: [CGPoint], template: [CGPoint], canvasSize: CGSize, character: String, index: Int) -> Bool {
        guard canvasSize.width > 0, canvasSize.height > 0, !user.isEmpty, !template.isEmpty else { return false }
        let expected = template.map { CGPoint(x: $0.x * canvasSize.width, y: $0.y * canvasSize.height) }
        let tolerance = max(14, min(20, min(canvasSize.width, canvasSize.height) * 0.055))
        return bestScore(user: user, expected: expected, tolerance: tolerance,
                         closed: LetterTraceTemplate.isClosed(character, stroke: index)).pass
    }

    private static func bestScore(user: [CGPoint], expected: [CGPoint], tolerance: CGFloat, closed: Bool) -> StrokeResult {
        if expected.count == 1 {
            var nearest = user.map { distance($0, expected[0]) }.min() ?? .infinity
            // Uwzględnij odcinki między próbkami: szybki ruch palca może minąć
            // punkt dokładnie, mimo że żadna pojedyncza próbka nie trafiła w kropkę.
            for pair in zip(user, user.dropFirst()) {
                nearest = min(nearest, distanceFromPointToSegment(expected[0], pair.0, pair.1))
            }
            return StrokeResult(pass: nearest <= tolerance, coverage: nearest <= tolerance ? 1 : 0,
                                average: nearest, error: nearest)
        }
        guard user.count >= 2, expected.count >= 2 else {
            return StrokeResult(pass: false, coverage: 0, average: .infinity, error: .infinity)
        }

        var variants = [expected]
        if closed, expected.count > 2 {
            let ring = Array(expected.dropLast())
            let first = user[0]
            let nearestIndex = ring.indices.min(by: { distance(first, ring[$0]) < distance(first, ring[$1]) }) ?? 0
            var rotated = Array(ring[nearestIndex...]) + Array(ring[..<nearestIndex])
            rotated.append(rotated[0])
            variants.append(rotated)
            var reversed = [rotated[0]] + Array(rotated.dropFirst().dropLast().reversed()) + [rotated[0]]
            if reversed.count == rotated.count { variants.append(reversed) }
        }

        let scores = variants.map { strokeScore(user: user, expected: $0, tolerance: tolerance) }
        return scores.first(where: { $0.pass }) ?? scores.max(by: {
            if $0.coverage != $1.coverage { return $0.coverage < $1.coverage }
            return $0.average > $1.average
        }) ?? StrokeResult(pass: false, coverage: 0, average: .infinity, error: .infinity)
    }

    private static func strokeScore(user: [CGPoint], expected: [CGPoint], tolerance: CGFloat) -> StrokeResult {
        let trace = resampleBySpacing(user, spacing: 4)
        guard let first = trace.first, let last = trace.last,
              let expectedFirst = expected.first, let expectedLast = expected.last else {
            return StrokeResult(pass: false, coverage: 0, average: .infinity, error: .infinity)
        }
        let startDistance = distance(first, expectedFirst)
        let endDistance = distance(last, expectedLast)
        guard startDistance <= tolerance * 1.35, endDistance <= tolerance * 1.35 else {
            return StrokeResult(pass: false, coverage: 0, average: .infinity,
                                error: max(startDistance, endDistance))
        }

        var matched = 0
        var cursor = 0
        var distanceSum: CGFloat = 0
        for dot in expected {
            var nearest = CGFloat.infinity
            var nearestIndex: Int?
            if cursor < trace.count {
                for index in cursor..<trace.count {
                    let current = distance(trace[index], dot)
                    if current < nearest {
                        nearest = current
                        nearestIndex = index
                    }
                }
            }
            if let nearestIndex, nearest <= tolerance {
                matched += 1
                distanceSum += nearest
                cursor = min(trace.count - 1, nearestIndex + 1)
            }
        }
        let coverage = CGFloat(matched) / CGFloat(expected.count)
        let average = matched > 0 ? distanceSum / CGFloat(matched) : .infinity
        let minimum: CGFloat = expected.count <= 5 ? 0.70 : 0.76
        let pass = coverage >= minimum && average <= tolerance * 0.85
        let error = (1 - coverage) + (average.isFinite ? average / max(tolerance, 1) : 1)
            + (startDistance + endDistance) / max(tolerance * 10, 1)
        return StrokeResult(pass: pass, coverage: coverage, average: average, error: error)
    }

    private static func distanceFromPointToSegment(_ point: CGPoint, _ start: CGPoint, _ end: CGPoint) -> CGFloat {
        let dx = end.x - start.x
        let dy = end.y - start.y
        let lengthSquared = dx * dx + dy * dy
        guard lengthSquared > 0.000001 else { return distance(point, start) }
        let projection = ((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared
        let t = min(1, max(0, projection))
        let nearest = CGPoint(x: start.x + t * dx, y: start.y + t * dy)
        return distance(point, nearest)
    }

    private static func distance(_ a: CGPoint, _ b: CGPoint) -> CGFloat {
        hypot(a.x - b.x, a.y - b.y)
    }

    private static func resampleBySpacing(_ points: [CGPoint], spacing: CGFloat) -> [CGPoint] {
        guard points.count >= 2 else { return points }
        var lengths: [CGFloat] = [0]
        for pair in zip(points, points.dropFirst()) {
            lengths.append(lengths.last! + distance(pair.0, pair.1))
        }
        guard let total = lengths.last, total >= 0.001 else { return [points[0]] }
        var result: [CGPoint] = []
        var segment = 1
        var target: CGFloat = 0
        while target < total {
            while segment < lengths.count - 1 && lengths[segment] < target { segment += 1 }
            let span = max(lengths[segment] - lengths[segment - 1], 0.0001)
            let t = min(1, max(0, (target - lengths[segment - 1]) / span))
            let a = points[segment - 1]
            let b = points[segment]
            result.append(CGPoint(x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t))
            target += spacing
        }
        result.append(points[points.count - 1])
        return result
    }
}
