import SwiftUI
import AVFoundation

struct LetterPracticeView: View {
    let letter: Letter
    @ObservedObject var progress: ProgressStore
    @State private var paths: [[CGPoint]] = []
    @State private var currentPath: [CGPoint] = []
    @State private var showSaved = false
    private let synthesizer = AVSpeechSynthesizer()

    var body: some View {
        VStack(spacing: 18) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Ćwiczymy literę").font(.headline).foregroundStyle(.secondary)
                    Text("\(letter.character)  \(letter.lowercase)")
                        .font(.system(size: 48, weight: .bold, design: .rounded))
                        .foregroundStyle(Color.indigo)
                }
                Spacer()
                Button(action: speakLetter) {
                    Label("Posłuchaj", systemImage: "speaker.wave.2.fill")
                }.buttonStyle(.bordered)
            }

            Text("Narysuj palcem literę na polu poniżej.")
                .font(.subheadline).foregroundStyle(.secondary)
                .frame(maxWidth: .infinity, alignment: .leading)

            ZStack {
                RoundedRectangle(cornerRadius: 24).fill(Color.white)
                RoundedRectangle(cornerRadius: 24)
                    .stroke(Color.indigo.opacity(0.18), style: StrokeStyle(lineWidth: 2, dash: [7, 7]))
                VStack {
                    Spacer()
                    Rectangle().fill(Color.gray.opacity(0.18)).frame(height: 1)
                    Spacer()
                }
                Text(letter.character)
                    .font(.system(size: 210, weight: .medium, design: .rounded))
                    .foregroundStyle(Color.indigo.opacity(0.12))
                    .minimumScaleFactor(0.5).lineLimit(1)
                Canvas { context, _ in
                    for points in paths + [currentPath] {
                        guard let first = points.first else { continue }
                        var path = Path()
                        path.move(to: first)
                        for point in points.dropFirst() { path.addLine(to: point) }
                        context.stroke(path, with: .color(Color.orange),
                                       style: StrokeStyle(lineWidth: 8, lineCap: .round, lineJoin: .round))
                    }
                }
                .contentShape(Rectangle())
                .gesture(DragGesture(minimumDistance: 0)
                    .onChanged { currentPath.append($0.location) }
                    .onEnded { _ in
                        if !currentPath.isEmpty { paths.append(currentPath) }
                        currentPath = []
                    })
            }
            .frame(height: 300)
            .accessibilityLabel("Pole do ćwiczenia pisania litery \(letter.character)")

            HStack(spacing: 12) {
                Button {
                    paths.removeAll()
                    currentPath.removeAll()
                } label: {
                    Label("Wyczyść", systemImage: "arrow.counterclockwise")
                        .frame(maxWidth: .infinity)
                }.buttonStyle(.bordered)

                Button {
                    progress.markCompleted(letter)
                    showSaved = true
                } label: {
                    Label("Gotowe!", systemImage: "star.fill")
                        .frame(maxWidth: .infinity)
                }.buttonStyle(.borderedProminent).disabled(paths.isEmpty)
            }

            if showSaved || progress.isCompleted(letter) {
                Label("Świetna praca! Litera zapisana.", systemImage: "checkmark.seal.fill")
                    .font(.subheadline.weight(.semibold)).foregroundStyle(.green)
            }

            Text("Przykładowe słowo: \(letter.example)")
                .font(.title3.weight(.semibold))
            Spacer(minLength: 0)
        }
        .padding()
        .navigationTitle("Moja literka")
        .navigationBarTitleDisplayMode(.inline)
    }

    private func speakLetter() {
        let utterance = AVSpeechUtterance(string: letter.character)
        utterance.voice = AVSpeechSynthesisVoice(language: "pl-PL")
        utterance.rate = AVSpeechUtteranceDefaultSpeechRate * 0.8
        synthesizer.speak(utterance)
    }
}