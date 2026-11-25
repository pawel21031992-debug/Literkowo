import Foundation
import Combine

@MainActor
final class ProgressStore: ObservableObject {
    @Published private(set) var completedLetters: Set<String> = []
    @Published private(set) var stars: Int = 0
    @Published private(set) var completedWords: Set<String> = []

    private let lettersKey = "literkowo.completedLetters"
    private let starsKey = "literkowo.stars"
    private let wordsKey = "literkowo.completedWords"

    init() {
        let saved = Set(UserDefaults.standard.stringArray(forKey: lettersKey) ?? [])
        completedLetters = Set(saved.map { $0.contains(":") ? $0 : $0 + ":upper" })
        if completedLetters != saved { UserDefaults.standard.set(completedLetters.sorted(), forKey: lettersKey) }
        stars = UserDefaults.standard.integer(forKey: starsKey)
        completedWords = Set(UserDefaults.standard.stringArray(forKey: wordsKey) ?? [])
    }

    var completedCount: Int { completedLetters.count }

    func markCompleted(_ letter: Letter, lowercase: Bool = false) {
        let key = letter.character + (lowercase ? ":lower" : ":upper")
        if completedLetters.insert(key).inserted {
            stars += 1
        }
        UserDefaults.standard.set(completedLetters.sorted(), forKey: lettersKey)
        UserDefaults.standard.set(stars, forKey: starsKey)
    }

    func markWordCompleted(_ word: String) {
        if completedWords.insert(word).inserted {
            stars += 1
            UserDefaults.standard.set(completedWords.sorted(), forKey: wordsKey)
            UserDefaults.standard.set(stars, forKey: starsKey)
        }
    }

    func isCompleted(_ letter: Letter, lowercase: Bool = false) -> Bool {
        completedLetters.contains(letter.character + (lowercase ? ":lower" : ":upper"))
    }

    func isWordCompleted(_ word: String) -> Bool {
        completedWords.contains(word)
    }

    func reset() {
        completedLetters.removeAll()
        completedWords.removeAll()
        stars = 0
        UserDefaults.standard.removeObject(forKey: lettersKey)
        UserDefaults.standard.removeObject(forKey: wordsKey)
        UserDefaults.standard.removeObject(forKey: starsKey)
    }
}