import SwiftUI
import AVFoundation

struct LetterPracticeView: View {
    let letter: Letter
    @ObservedObject var progress: ProgressStore

    @State private var paths: [[CGPoint]] = []
    @State private var currentPath: [CGPoint] = []
    @State private var showSaved = false
    @State private var selectedWord: String?
    @State private var guideStep = 0
    private let synthesizer = AVSpeechSynthesizer()

    private var guideInstructions: [String] {
        ["Zacznij na górze litery.", "Prowadź palec powoli po jasnym wzorze.", "Dokończ kształt i unieś palec."]
    }

    var body: some View {
        ScrollView {
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

                VStack(alignment: .leading, spacing: 8) {
                    Label("Wskazówka pisania", systemImage: "hand.draw")
                        .font(.headline)
                    TimelineView(.periodic(from: .now, by: 1.6)) { context in
                        let activeStep = Int(context.date.timeIntervalSinceReferenceDate / 1.6) % guideInstructions.count
                        HStack(spacing: 8) {
                            ForEach(0..<guideInstructions.count, id: \\.self) { index in
                                Circle()
                                    .fill(index == activeStep ? Color.orange : Color.indigo.opacity(0.18))
                                    .frame(width: 28, height: 28)
                                    .overlay(Text("\\(index + 1)").font(.caption.bold())
                                        .foregroundStyle(index == activeStep ? .white : .indigo))
                            }
                            Text(guideInstructions[activeStep])
                                .font(.subheadline)
                        }
                    }
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding()
                .background(Color.indigo.opacity(0.07), in: RoundedRectangle(cornerRadius: 18))

                Text("Przesuwaj palcem po jasnym wzorze.")
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
                        .foregroundStyle(Color.indigo.opacity(0.16))
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
                .frame(height: 290)
                .accessibilityLabel("Pole do ćwiczenia pisania litery \(letter.character)")

                HStack(spacing: 12) {
                    Button {
                        paths.removeAll()
                        currentPath.removeAll()
                        showSaved = false
                    } label: {
                        Label("Wyczyść", systemImage: "arrow.counterclockwise")
                            .frame(maxWidth: .infinity)
                    }.buttonStyle(.bordered)

                    Button {
                        progress.markCompleted(letter)
                        showSaved = true
                    } label: {
                        Label("Zdobądź gwiazdkę", systemImage: "star.fill")
                            .frame(maxWidth: .infinity)
                    }.buttonStyle(.borderedProminent).disabled(paths.isEmpty)
                }

                if showSaved || progress.isCompleted(letter) {
                    Label("Brawo! Zdobywasz gwiazdkę.", systemImage: "checkmark.seal.fill")
                        .font(.subheadline.weight(.semibold)).foregroundStyle(.green)
                }

                learningCard(title: "Sylaby", subtitle: "Przeczytaj na głos", items: letter.syllables, action: speak)
                learningCard(title: "Wyrazy", subtitle: "Dotknij wyrazu, aby go usłyszeć", items: letter.words) { word in
                    selectedWord = word
                    speak(word)
                }

                if let selectedWord {
                    Button {
                        progress.markWordCompleted(selectedWord)
                    } label: {
                        Label(progress.isWordCompleted(selectedWord) ? "Wyraz zaliczony" : "Umiem ten wyraz!",
                              systemImage: "star.fill")
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(.orange)
                }
                Text("Przykładowe słowo: \(letter.example)")
                    .font(.title3.weight(.semibold))
            }
            .padding()
        }
        .navigationTitle("Moja literka")
        .navigationBarTitleDisplayMode(.inline)
    }

    private func learningCard(title: String, subtitle: String, items: [String], action: @escaping (String) -> Void) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            Text(title).font(.headline)
            Text(subtitle).font(.caption).foregroundStyle(.secondary)
            LazyVGrid(columns: [GridItem(.adaptive(minimum: 76))], spacing: 8) {
                ForEach(items, id: \.self) { item in
                    Button(item) { action(item) }
                        .font(.headline)
                        .frame(maxWidth: .infinity, minHeight: 42)
                        .background(Color.orange.opacity(0.12), in: RoundedRectangle(cornerRadius: 12))
                        .buttonStyle(.plain)
                }
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .background(Color(.secondarySystemGroupedBackground), in: RoundedRectangle(cornerRadius: 18))
    }

    private func speakLetter() { speak(letter.character) }

    private func speak(_ text: String) {
        let utterance = AVSpeechUtterance(string: text)
        utterance.voice = AVSpeechSynthesisVoice(language: "pl-PL")
        utterance.rate = AVSpeechUtteranceDefaultSpeechRate * 0.78
        synthesizer.speak(utterance)
    }
}