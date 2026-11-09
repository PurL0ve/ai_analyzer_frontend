export function findJdCandidate(lines, skill) {
  const index = lines.findIndex((line) =>
    line.toLowerCase().includes(skill.toLowerCase())
  )
  if (index === -1) {
    return undefined
  }
  return {
    lineNumber: index + 1,
    text: lines[index]
  }
}
