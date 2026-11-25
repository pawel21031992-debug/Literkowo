import SwiftUI
import AVFoundation

struct LetterPracticeView: View {
    let letter: Letter
    @ObservedObject var progress: ProgressStore

    @State private var lowercaseMode = false
    @State private var paths: [[CGPoint]] = []
    @State private var currentPath: [CGPoint] = []
    @State private var showSaved = false
    @State private var selectedWord: String?
    @State private var drawingSize: CGSize = CGSize(width: 320, height: 290)
    private let synthesizer = AVSpeechSynthesizer()

    private var activeCharacter: String { lowercaseMode ? letter.lowercase : letter.character }

    private var templateStrokes: [[CGPoint]] {
        LetterTraceTemplate.strokes(for: activeCharacter, canvasSize: drawingSize)
    }

    private var evaluation: LetterTraceEvaluation {
        LetterTraceEvaluator.evaluate(userStrokes: paths, templateStrokes: templateStrokes, canvasSize: drawingSize)
    }

    private var hasUsableTrace: Bool {
        evaluation.isAccepted
    }

    private var tracePointCount: Int {
        paths.reduce(0) { $0 + $1.count }
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 18) {
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Ćwiczymy literę").font(.headline).foregroundStyle(.secondary)
                        Text(lowercaseMode ? letter.lowercase : letter.character)
                            .font(.system(size: 48, weight: .bold, design: .rounded))
                            .foregroundStyle(Color.indigo)
                    }
                    Spacer()
                    Button(action: speakLetter) {
                        Label("Posłuchaj", systemImage: "speaker.wave.2.fill")
                    }.buttonStyle(.bordered)
                }

                Picker("Rodzaj litery", selection: $lowercaseMode) {
                    Text("Wielka").tag(false)
                    Text("Mała").tag(true)
                }
                .pickerStyle(.segmented)
                .onChange(of: lowercaseMode) { _ in
                    paths.removeAll()
                    currentPath.removeAll()
                    showSaved = false
                }

                VStack(alignment: .leading, spacing: 8) {
                    Label("Wskazówka pisania", systemImage: "hand.draw")
                        .font(.headline)
                    Text("Każdy numer oznacza jeden ruch. Zacznij przy pomarańczowym punkcie i prowadź palec zgodnie ze strzałką. Wykonuj ruchy po kolei.")
                        .font(.subheadline)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding()
                .background(Color.indigo.opacity(0.07), in: RoundedRectangle(cornerRadius: 18))

                Text("Wykonuj ruchy po jasnych liniach w kolejności oznaczonej numerami.")
                    .font(.subheadline).foregroundStyle(.secondary)
                    .frame(maxWidth: .infinity, alignment: .leading)

                GeometryReader { geometry in
                    ZStack {
                        RoundedRectangle(cornerRadius: 24).fill(Color.white)
                        RoundedRectangle(cornerRadius: 24)
                            .stroke(Color.indigo.opacity(0.18), style: StrokeStyle(lineWidth: 2, dash: [7, 7]))
                        Canvas { context, size in
                            for (index, stroke) in templateStrokes.enumerated() {
                                guard let first = stroke.first else { continue }
                                var guide = Path()
                                guide.move(to: CGPoint(x: first.x * size.width, y: first.y * size.height))
                                for point in stroke.dropFirst() {
                                    guide.addLine(to: CGPoint(x: point.x * size.width, y: point.y * size.height))
                                }
                                context.stroke(guide, with: .color(Color.indigo.opacity(0.30)),
                                               style: StrokeStyle(lineWidth: 11, lineCap: .round, lineJoin: .round, dash: [5, 5]))
                                let start = CGPoint(x: first.x * size.width, y: first.y * size.height)
                                let marker = CGRect(x: start.x - 11, y: start.y - 11, width: 22, height: 22)
                                context.fill(Path(ellipseIn: marker), with: .color(.orange))
                                context.draw(Text("\(index + 1)").font(.system(size: 12, weight: .bold)).foregroundColor(.white),
                                             at: start)
                                if stroke.count > 1 {
                                    let segmentIndex = max(0, stroke.count / 2 - 1)
                                    let arrowStart = stroke[segmentIndex]
                                    let arrowEnd = stroke[min(segmentIndex + 1, stroke.count - 1)]
                                    let arrowPoint = CGPoint(x: (arrowStart.x + arrowEnd.x) * size.width / 2,
                                                             y: (arrowStart.y + arrowEnd.y) * size.height / 2)
                                    let angle = atan2((arrowEnd.y - arrowStart.y) * size.height,
                                                      (arrowEnd.x - arrowStart.x) * size.width)
                                    let ux = cos(angle)
                                    let uy = sin(angle)
                                    let px = -uy
                                    let py = ux
                                    let tip = CGPoint(x: arrowPoint.x + ux * 9, y: arrowPoint.y + uy * 9)
                                    var arrowPath = Path()
                                    arrowPath.move(to: CGPoint(x: arrowPoint.x - ux * 8, y: arrowPoint.y - uy * 8))
                                    arrowPath.addLine(to: tip)
                                    arrowPath.move(to: tip)
                                    arrowPath.addLine(to: CGPoint(x: tip.x - ux * 7 + px * 5, y: tip.y - uy * 7 + py * 5))
                                    arrowPath.move(to: tip)
                                    arrowPath.addLine(to: CGPoint(x: tip.x - ux * 7 - px * 5, y: tip.y - uy * 7 - py * 5))
                                    context.stroke(arrowPath, with: .color(.orange), style: StrokeStyle(lineWidth: 3, lineCap: .round, lineJoin: .round))
                                }
                            }
                            for points in paths + [currentPath] {
                                guard let first = points.first else { continue }
                                var userPath = Path()
                                userPath.move(to: first)
                                for point in points.dropFirst() { userPath.addLine(to: point) }
                                context.stroke(userPath, with: .color(Color.orange),
                                               style: StrokeStyle(lineWidth: 8, lineCap: .round, lineJoin: .round))
                            }
                        }
                        .contentShape(Rectangle())
                        .gesture(DragGesture(minimumDistance: 0)
                            .onChanged { value in
                                showSaved = false
                                currentPath.append(value.location)
                            }
                            .onEnded { _ in
                                if !currentPath.isEmpty { paths.append(currentPath) }
                                currentPath = []
                            })
                    }
                    .onAppear { drawingSize = geometry.size }
                    .onChange(of: geometry.size) { newSize in drawingSize = newSize }
                }
                .frame(height: 290)
                .accessibilityLabel("Pole do ćwiczenia pisania litery \(activeCharacter)")

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
                        guard hasUsableTrace else { return }
                        progress.markCompleted(letter, lowercase: lowercaseMode)
                        showSaved = true
                    } label: {
                        Label("Zapisz ćwiczenie", systemImage: "star.fill")
                            .frame(maxWidth: .infinity)
                    }.buttonStyle(.borderedProminent).disabled(!hasUsableTrace)
                }

                if !paths.isEmpty {
                    VStack(alignment: .leading, spacing: 5) {
                        Label(hasUsableTrace ? "Ślad został zarejestrowany." : "Dorysuj jeszcze kilka fragmentów.", systemImage: hasUsableTrace ? "checkmark.circle" : "pencil")
                            .font(.subheadline.weight(.semibold))
                            .foregroundStyle(hasUsableTrace ? .green : .orange)
                        Text("\(evaluation.message) Zarejestrowano \(tracePointCount) punktów. Ocena porównuje kształt, kolejność i kierunek ruchów z uproszczonym wzorem.")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding()
                    .background(Color(.secondarySystemGroupedBackground), in: RoundedRectangle(cornerRadius: 14))
                }

                if showSaved || progress.isCompleted(letter, lowercase: lowercaseMode) {
                    Label("Ćwiczenie zapisane. Brawo!", systemImage: "checkmark.seal.fill")
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

    private func speakLetter() { speak(activeCharacter) }

    private func speak(_ text: String) {
        let utterance = AVSpeechUtterance(string: text)
        utterance.voice = AVSpeechSynthesisVoice(language: "pl-PL")
        utterance.rate = AVSpeechUtteranceDefaultSpeechRate * 0.78
        synthesizer.speak(utterance)
    }
}