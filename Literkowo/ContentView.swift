import SwiftUI

struct ContentView: View {
    @StateObject private var progress = ProgressStore()
    private let columns = [GridItem(.adaptive(minimum: 68), spacing: 12)]

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 22) {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Cześć, mały odkrywco!").font(.largeTitle.bold())
                        Text("Poznaj polskie literki, sylaby i pierwsze wyrazy.")
                            .font(.title3).foregroundStyle(.secondary)
                    }

                    HStack(spacing: 12) {
                        Image(systemName: "star.fill").font(.title2).foregroundStyle(.orange)
                        VStack(alignment: .leading, spacing: 2) {
                            Text("Twoje nagrody").font(.headline)
                            Text("\(progress.stars) gwiazdek • \(progress.completedCount) z 32 liter")
                                .font(.subheadline).foregroundStyle(.secondary)
                        }
                        Spacer()
                        ProgressView(value: Double(progress.completedCount), total: 32)
                            .tint(.orange).frame(width: 88)
                    }
                    .padding()
                    .background(Color.orange.opacity(0.10), in: RoundedRectangle(cornerRadius: 18))

                    Text("Wybierz literę").font(.title2.bold())

                    LazyVGrid(columns: columns, spacing: 12) {
                        ForEach(Letter.polishAlphabet) { letter in
                            NavigationLink {
                                LetterPracticeView(letter: letter, progress: progress)
                            } label: {
                                VStack(spacing: 5) {
                                    Text(letter.character)
                                        .font(.system(size: 30, weight: .bold, design: .rounded))
                                    Text(letter.lowercase)
                                        .font(.caption.weight(.medium)).foregroundStyle(.secondary)
                                    Image(systemName: progress.isCompleted(letter) ? "star.fill" : "circle")
                                        .font(.caption2)
                                        .foregroundStyle(progress.isCompleted(letter) ? .orange : .clear)
                                }
                                .frame(maxWidth: .infinity).frame(height: 82)
                                .background(Color.indigo.opacity(0.08), in: RoundedRectangle(cornerRadius: 16))
                                .overlay(RoundedRectangle(cornerRadius: 16).stroke(Color.indigo.opacity(0.12)))
                            }
                            .buttonStyle(.plain)
                            .accessibilityLabel("Litera \(letter.character), \(letter.lowercase)")
                        }
                    }

                    Button(role: .destructive) {
                        progress.reset()
                    } label: {
                        Text("Wyzeruj postępy").font(.footnote)
                    }
                }
                .padding()
            }
            .background(Color(uiColor: .systemGroupedBackground))
            .navigationTitle("Literkowo")
            .navigationBarTitleDisplayMode(.inline)
        }
    }
}