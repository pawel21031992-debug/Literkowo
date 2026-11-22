import SwiftUI

/// Wzorce są zapisane w układzie współrzędnych 0...1.
/// Każda podtablica oznacza osobny ruch, a kolejność punktów określa kierunek pisania.
enum LetterTraceTemplate {
    static func strokes(for character: String) -> [[CGPoint]] {
        let p: (CGFloat, CGFloat) -> CGPoint = { CGPoint(x: $0, y: $1) }
        let templates: [String: [[CGPoint]]] = [
            "A": [[p(0.50,0.14),p(0.18,0.86)],[p(0.50,0.14),p(0.82,0.86)],[p(0.32,0.60),p(0.68,0.60)]],
            "Ą": [[p(0.18,0.86),p(0.50,0.14),p(0.82,0.86)],[p(0.32,0.60),p(0.68,0.60)],[p(0.67,0.82),p(0.74,0.91),p(0.68,0.98)]],
            "B": [[p(0.24,0.14),p(0.24,0.86)],[p(0.24,0.14),p(0.58,0.14),p(0.78,0.25),p(0.78,0.39),p(0.62,0.49),p(0.24,0.50)],[p(0.24,0.50),p(0.63,0.50),p(0.82,0.62),p(0.82,0.76),p(0.64,0.86),p(0.24,0.86)]],
            "C": [[p(0.80,0.22),p(0.65,0.14),p(0.43,0.14),p(0.25,0.27),p(0.18,0.50),p(0.25,0.73),p(0.43,0.86),p(0.65,0.86),p(0.80,0.78)]],
            "Ć": [[p(0.80,0.22),p(0.65,0.14),p(0.43,0.14),p(0.25,0.27),p(0.18,0.50),p(0.25,0.73),p(0.43,0.86),p(0.65,0.86),p(0.80,0.78)],[p(0.40,0.06),p(0.62,0.00)]],
            "D": [[p(0.22,0.14),p(0.22,0.86)],[p(0.22,0.14),p(0.48,0.14),p(0.70,0.23),p(0.83,0.40),p(0.83,0.60),p(0.70,0.77),p(0.48,0.86),p(0.22,0.86)]],
            "E": [[p(0.25,0.14),p(0.25,0.86)],[p(0.25,0.14),p(0.80,0.14)],[p(0.25,0.50),p(0.70,0.50)],[p(0.25,0.86),p(0.80,0.86)]],
            "Ę": [[p(0.25,0.14),p(0.25,0.86)],[p(0.25,0.14),p(0.80,0.14)],[p(0.25,0.50),p(0.70,0.50)],[p(0.25,0.86),p(0.80,0.86)],[p(0.68,0.82),p(0.76,0.91),p(0.68,0.98)]],
            "F": [[p(0.25,0.14),p(0.25,0.86)],[p(0.25,0.14),p(0.80,0.14)],[p(0.25,0.50),p(0.70,0.50)]],
            "G": [[p(0.80,0.22),p(0.65,0.14),p(0.43,0.14),p(0.25,0.27),p(0.18,0.50),p(0.25,0.73),p(0.43,0.86),p(0.65,0.86),p(0.80,0.76),p(0.80,0.56),p(0.58,0.56)]],
            "H": [[p(0.24,0.14),p(0.24,0.86)],[p(0.76,0.14),p(0.76,0.86)],[p(0.24,0.50),p(0.76,0.50)]],
            "I": [[p(0.30,0.14),p(0.70,0.14)],[p(0.50,0.14),p(0.50,0.86)],[p(0.30,0.86),p(0.70,0.86)]],
            "J": [[p(0.28,0.14),p(0.78,0.14)],[p(0.68,0.14),p(0.68,0.68),p(0.60,0.82),p(0.43,0.88),p(0.27,0.80)]],
            "K": [[p(0.24,0.14),p(0.24,0.86)],[p(0.76,0.14),p(0.24,0.52),p(0.80,0.86)]],
            "L": [[p(0.25,0.14),p(0.25,0.86),p(0.80,0.86)]],
            "Ł": [[p(0.25,0.14),p(0.25,0.86),p(0.80,0.86)],[p(0.18,0.62),p(0.82,0.34)]],
            "M": [[p(0.18,0.86),p(0.18,0.14),p(0.50,0.55),p(0.82,0.14),p(0.82,0.86)]],
            "N": [[p(0.22,0.86),p(0.22,0.14),p(0.78,0.86),p(0.78,0.14)]],
            "Ń": [[p(0.22,0.86),p(0.22,0.14),p(0.78,0.86),p(0.78,0.14)],[p(0.40,0.06),p(0.62,0.00)]],
            "O": [[p(0.50,0.14),p(0.70,0.17),p(0.82,0.34),p(0.84,0.52),p(0.76,0.72),p(0.60,0.85),p(0.40,0.85),p(0.24,0.72),p(0.16,0.52),p(0.18,0.34),p(0.30,0.17),p(0.50,0.14)]],
            "Ó": [[p(0.50,0.14),p(0.70,0.17),p(0.82,0.34),p(0.84,0.52),p(0.76,0.72),p(0.60,0.85),p(0.40,0.85),p(0.24,0.72),p(0.16,0.52),p(0.18,0.34),p(0.30,0.17),p(0.50,0.14)],[p(0.40,0.06),p(0.62,0.00)]],
            "P": [[p(0.24,0.86),p(0.24,0.14),p(0.58,0.14),p(0.78,0.24),p(0.80,0.39),p(0.66,0.50),p(0.24,0.50)]],
            "R": [[p(0.24,0.86),p(0.24,0.14),p(0.58,0.14),p(0.78,0.24),p(0.80,0.39),p(0.66,0.50),p(0.24,0.50)],[p(0.50,0.50),p(0.82,0.86)]],
            "S": [[p(0.78,0.23),p(0.62,0.14),p(0.40,0.14),p(0.23,0.26),p(0.27,0.42),p(0.50,0.50),p(0.73,0.58),p(0.80,0.74),p(0.63,0.86),p(0.40,0.86),p(0.22,0.77)]],
            "Ś": [[p(0.78,0.23),p(0.62,0.14),p(0.40,0.14),p(0.23,0.26),p(0.27,0.42),p(0.50,0.50),p(0.73,0.58),p(0.80,0.74),p(0.63,0.86),p(0.40,0.86),p(0.22,0.77)],[p(0.40,0.06),p(0.62,0.00)]],
            "T": [[p(0.18,0.14),p(0.82,0.14)],[p(0.50,0.14),p(0.50,0.86)]],
            "U": [[p(0.22,0.14),p(0.22,0.62),p(0.28,0.78),p(0.42,0.86),p(0.58,0.86),p(0.72,0.78),p(0.78,0.62),p(0.78,0.14)]],
            "W": [[p(0.14,0.14),p(0.28,0.86),p(0.50,0.48),p(0.72,0.86),p(0.86,0.14)]],
            "Y": [[p(0.18,0.14),p(0.50,0.50),p(0.82,0.14)],[p(0.50,0.50),p(0.50,0.86)]],
            "Z": [[p(0.20,0.14),p(0.80,0.14),p(0.20,0.86),p(0.80,0.86)]],
            "Ź": [[p(0.20,0.14),p(0.80,0.14),p(0.20,0.86),p(0.80,0.86)],[p(0.40,0.06),p(0.62,0.00)]],
            "Ż": [[p(0.20,0.14),p(0.80,0.14),p(0.20,0.86),p(0.80,0.86)],[p(0.50,0.035)]]
        ]
        return templates[character] ?? []
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
            return LetterTraceEvaluation(isAccepted: false, score: 1, message: "Nie można ocenić tego wzoru.")
        }
        guard userStrokes.count == templateStrokes.count else {
            return LetterTraceEvaluation(isAccepted: false, score: 1, message: "Liczba ruchów jest inna niż we wzorze. Sprawdź numerację i spróbuj ponownie.")
        }
        var total: CGFloat = 0
        for (user, template) in zip(userStrokes, templateStrokes) {
            guard user.count >= 4, template.count >= 2 else {
                return LetterTraceEvaluation(isAccepted: false, score: 1, message: "Dokończ każdy ruch jednym płynnym pociągnięciem.")
            }
            let normalizedUser = user.map { CGPoint(x: $0.x / canvasSize.width, y: $0.y / canvasSize.height) }
            let a = resample(normalizedUser, count: 32)
            let b = resample(template, count: 32)
            let meanDistance = zip(a, b).reduce(CGFloat.zero) { partial, pair in
                let dx = pair.0.x - pair.1.x
                let dy = pair.0.y - pair.1.y
                return partial + sqrt(dx * dx + dy * dy)
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
