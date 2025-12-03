export default {
    types: {
        feat: { title: "🚀 Features", semver: "minor" },
        fix: { title: "🐛 Bug Fixes", semver: "patch" },
        perf: { title: "⚡ Performance", semver: "patch" },
        refactor: { title: "♻️ Refactors", semver: "patch" },
        docs: { title: "📖 Documentation", semver: "patch" },
        build: { title: "📦 Build", semver: "patch" },
        style: { title: "💅 Styles", semver: "patch" },
        chore: { title: "🏡 Chore" },
        test: { title: "✅ Tests" },
        ci: { title: "🤖 CI" },
    },
    output: "CHANGELOG.md",
    repo: {
        provider: "github",
        repo: "Life-Palette/LifePalette-Web",
    },
};
