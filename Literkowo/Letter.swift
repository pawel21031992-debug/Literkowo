import Foundation

struct Letter: Identifiable, Hashable {
    let character: String
    let lowercase: String
    let example: String
    var id: String { character }

    static let polishAlphabet: [Letter] = [
        .init(character: "A", lowercase: "a", example: "auto"),
        .init(character: "Ą", lowercase: "ą", example: "ąka"),
        .init(character: "B", lowercase: "b", example: "balon"),
        .init(character: "C", lowercase: "c", example: "cebula"),
        .init(character: "Ć", lowercase: "ć", example: "ćma"),
        .init(character: "D", lowercase: "d", example: "dom"),
        .init(character: "E", lowercase: "e", example: "ekran"),
        .init(character: "Ę", lowercase: "ę", example: "język"),
        .init(character: "F", lowercase: "f", example: "foka"),
        .init(character: "G", lowercase: "g", example: "gitara"),
        .init(character: "H", lowercase: "h", example: "hak"),
        .init(character: "I", lowercase: "i", example: "igła"),
        .init(character: "J", lowercase: "j", example: "jabłko"),
        .init(character: "K", lowercase: "k", example: "kot"),
        .init(character: "L", lowercase: "l", example: "lalka"),
        .init(character: "Ł", lowercase: "ł", example: "łódka"),
        .init(character: "M", lowercase: "m", example: "motyl"),
        .init(character: "N", lowercase: "n", example: "nos"),
        .init(character: "Ń", lowercase: "ń", example: "koń"),
        .init(character: "O", lowercase: "o", example: "oko"),
        .init(character: "Ó", lowercase: "ó", example: "ósmy"),
        .init(character: "P", lowercase: "p", example: "pies"),
        .init(character: "R", lowercase: "r", example: "rak"),
        .init(character: "S", lowercase: "s", example: "sowa"),
        .init(character: "Ś", lowercase: "ś", example: "ślimak"),
        .init(character: "T", lowercase: "t", example: "tort"),
        .init(character: "U", lowercase: "u", example: "ul"),
        .init(character: "W", lowercase: "w", example: "woda"),
        .init(character: "Y", lowercase: "y", example: "yoyo"),
        .init(character: "Z", lowercase: "z", example: "zamek"),
        .init(character: "Ź", lowercase: "ź", example: "źrebak"),
        .init(character: "Ż", lowercase: "ż", example: "żaba")
    ]
}