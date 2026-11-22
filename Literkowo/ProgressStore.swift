import Foundation
import Combine

@MainActor
final class ProgressStore: ObservableObject {
    @Published private(set) var completedLetters: Set<String> = []
    private let storageKey = "literkowo.completedLetters"

    init() {
        completedLetters = Set(UserDefaults.standard.stringArray(forKey: storageKey) ?? [])
    }

    var completedCount: Int { completedLetters.count }

    func markCompleted(_ letter: Letter) {
        completedLetters.insert(letter.character)
        UserDefaults.standard.set(completedLetters.sorted(), forKey: storageKey)
    }

    func isCompleted(_ letter: Letter) -> Bool {
        completedLetters.contains(letter.character)
    }

    func reset() {
        completedLetters.removeAll()
        UserDefaults.standard.removeObject(forKey: storageKey)
    }
}