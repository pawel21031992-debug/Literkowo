import Foundation

struct Letter: Identifiable, Hashable {
    let character: String
    let lowercase: String
    let example: String
    var id: String { character }

    private var isVowel: Bool {
        ["A", "Ą", "E", "Ę", "I", "O", "Ó", "U", "Y"].contains(character)
    }

    var syllables: [String] {
        if isVowel { return [lowercase, "ma", "me", "mi", "mo", "mu"] }
        return ["a", "e", "i", "o", "u", "y"].map { lowercase + $0 }
    }

    var writingInstructions: [String] {
        let guides: [String: [String]] = [
            "A": ["Zacznij na dole po lewej, poprowadź linię do szczytu, a następnie w dół po prawej jednym ciągłym ruchem.", "Dorysuj poprzeczną kreskę od lewej do prawej."],
            "Ą": ["Poprowadź lewą ukośną linię od szczytu do dołu.", "Poprowadź prawą ukośną linię od szczytu do dołu.", "Narysuj poprzeczkę od lewej do prawej.", "Dodaj ogonek po prawej stronie."],
            "B": ["Narysuj pionową linię z góry na dół.", "Od góry poprowadź łuk w prawo i wróć do środka.", "Od środka narysuj drugi, dolny łuk."],
            "C": ["Zacznij u góry po prawej i jednym płynnym łukiem poprowadź linię w lewo, w dół i z powrotem ku górze po prawej."],
            "Ć": ["Narysuj literę C jednym szerokim łukiem.", "Dodaj ukośną kreskę nad literą."],
            "D": ["Narysuj pionową linię z góry na dół.", "Zacznij u góry i jednym łukiem poprowadź linię w prawo, w dół i do podstawy."],
            "E": ["Narysuj pionową linię z góry na dół.", "Dodaj górną kreskę od lewej do prawej.", "Dodaj środkową kreskę od lewej do prawej.", "Dodaj dolną kreskę od lewej do prawej."],
            "Ę": ["Narysuj pionową linię z góry na dół.", "Dodaj górną kreskę od lewej do prawej.", "Dodaj środkową kreskę od lewej do prawej.", "Dodaj dolną kreskę od lewej do prawej.", "Dorysuj ogonek przy dolnej części litery."],
            "F": ["Narysuj pionową linię z góry na dół.", "Dodaj długą górną kreskę.", "Dodaj krótszą kreskę na środku."],
            "G": ["Narysuj zaokrąglony kształt litery G, prowadząc łuk zgodnie ze strzałką.", "Dorysuj krótką kreskę w środku, od lewej do prawej."],
            "H": ["Narysuj lewą pionową linię.", "Narysuj prawą pionową linię.", "Połącz je kreską na środku."],
            "I": ["Narysuj górną krótką kreskę.", "Poprowadź pionową linię w dół.", "Dodaj dolną krótką kreskę."],
            "J": ["Zacznij u góry, poprowadź linię w dół i zakończ łukiem zawiniętym w lewo."],
            "K": ["Narysuj pionową linię z góry na dół.", "Od środka poprowadź ukośną linię w górę na prawo.", "Od środka poprowadź drugą ukośną linię w dół na prawo."],
            "L": ["Narysuj pionową linię z góry na dół.", "Dorysuj dolną kreskę od lewej do prawej."],
            "Ł": ["Narysuj pionową linię z góry na dół.", "Dorysuj dolną kreskę od lewej do prawej.", "Przez literę poprowadź ukośną kreskę z dołu po lewej ku górze po prawej."],
            "M": ["Narysuj lewą pionową linię z góry na dół.", "Od dołu po lewej poprowadź ukośną linię do dolnego środka.", "Od środka poprowadź ukośną linię do góry po prawej.", "Narysuj prawą pionową linię z góry na dół."],
            "N": ["Narysuj lewą pionową linię.", "Połącz górę lewej strony z dołem prawej ukośną linią.", "Narysuj prawą pionową linię."],
            "Ń": ["Narysuj lewą pionową linię.", "Połącz górę lewej strony z dołem prawej ukośną linią.", "Narysuj prawą pionową linię.", "Dodaj ukośną kreskę nad literą."],
            "O": ["Zacznij u góry i jednym płynnym ruchem poprowadź zaokrąglony kształt, aż zamkniesz literę."],
            "Ó": ["Zacznij u góry i jednym płynnym ruchem narysuj zamknięte O.", "Dodaj ukośną kreskę nad literą."],
            "P": ["Narysuj pionową linię z góry na dół.", "Od góry poprowadź łuk w prawo i wróć do pionowej linii w połowie wysokości."],
            "R": ["Narysuj pionową linię z góry na dół.", "Narysuj górny łuk i zamknij go w połowie.", "Od środka poprowadź ukośną nogę w dół na prawo."],
            "S": ["Zacznij u góry po prawej i jednym falistym ruchem poprowadź linię w lewo, w dół, a następnie w prawo do dolnego końca."],
            "Ś": ["Narysuj literę S jednym płynnym, falistym ruchem.", "Dodaj ukośną kreskę nad literą."],
            "T": ["Narysuj górną poziomą kreskę od lewej do prawej.", "Od środka poprowadź pionową linię w dół."],
            "U": ["Zacznij u góry po lewej, poprowadź linię w dół, zaokrąglij ją na dole i wróć do góry po prawej jednym ruchem."],
            "W": ["Poprowadź pierwszą ukośną linię z góry po lewej w dół do środka.", "Poprowadź drugą ukośną linię ze środka w górę.", "Poprowadź trzecią ukośną linię w dół.", "Zakończ czwartą ukośną linią skierowaną w górę po prawej."],
            "Y": ["Narysuj lewą górną ukośną linię do środka.", "Dorysuj prawą górną ukośną linię.", "Od środka poprowadź pionową linię w dół."],
            "Z": ["Narysuj literę Z jednym ciągłym ruchem: górna kreska, ukośna linia w dół w lewo i dolna kreska w prawo."],
            "Ź": ["Narysuj literę Z jednym ciągłym ruchem.", "Dodaj ukośną kreskę nad literą."],
            "Ż": ["Narysuj literę Z jednym ciągłym ruchem.", "Dodaj kropkę nad literą."]
        ]
        return guides[character] ?? ["Zacznij od górnej części litery.", "Prowadź linię spokojnie zgodnie ze wzorem.", "Dokończ kształt i unieś palec."]
    }

    var words: [String] {
        let extra: [String: [String]] = [
            "A": ["auto", "aparat", "ananas"], "Ą": ["wąż", "kąt", "pąk"],
            "B": ["balon", "but", "banan"], "C": ["cebula", "cukier", "cytryna"],
            "Ć": ["ćma", "ćwiczyć", "ćwierć"], "D": ["dom", "dach", "droga"],
            "E": ["ekran", "ekierka", "elf"], "Ę": ["gęś", "język", "mięta"],
            "F": ["foka", "farba", "flet"], "G": ["gitara", "góra", "garnek"],
            "H": ["hak", "hotel", "hamak"], "I": ["igła", "iskra", "indyk"],
            "J": ["jabłko", "jeleń", "jajko"], "K": ["kot", "kura", "klocki"],
            "L": ["lalka", "las", "lampa"], "Ł": ["łódka", "łąka", "łapa"],
            "M": ["motyl", "mama", "miska"], "N": ["nos", "noga", "namiot"],
            "Ń": ["koń", "słoń", "dłoń"], "O": ["oko", "okno", "owca"],
            "Ó": ["ósmy", "ogórek", "ósemka"], "P": ["pies", "piłka", "pociąg"],
            "R": ["rak", "rower", "ryba"], "S": ["sowa", "samolot", "ser"],
            "Ś": ["ślimak", "świat", "świeca"], "T": ["tata", "tort", "tulipan"],
            "U": ["ul", "ucho", "ubranie"], "W": ["woda", "wóz", "wiewiórka"],
            "Y": ["yoyo", "dynia", "ryba"], "Z": ["zamek", "zebra", "zegar"],
            "Ź": ["źrebak", "źródło", "gałąź"], "Ż": ["żaba", "żółw", "żyrafa"]
        ]
        return extra[character] ?? [example]
    }

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