export function normalizeVersion(versionString) {
    if (!versionString) return 0;
    return parseInt(versionString.replace(/^v/, "").replace(/\./g, "")) || 0;
}
