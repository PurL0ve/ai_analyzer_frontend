import { findJdCandidate } from "./jdCandidates"


function AnalysisResult(props){
  const result = props.result
  const submittedJD = result.submittedJD
  let lines = []

  if (submittedJD) {
    lines = submittedJD.split(/\r?\n/)
  }

  return (
    <div className = "result-box">
      {result.submittedRequiredSkills?.length > 0 && (
        <div>
          <h2>本次匹配的岗位要求:</h2>
          <p>{result.submittedRequiredSkills.join("、")}</p>
        </div>
      )}

      <h2>匹配技能:</h2>
      {result.matched.map((skill) => {
        const candidate = findJdCandidate(lines, skill)

        return (
          <p key={skill}>
            {skill}
            {submittedJD && (
              <span className = "jd-candidate"> · {candidate ? `第 ${candidate.lineNumber} 行 · ${candidate.text}` : "未找到原文候选"}</span>
            )}
          </p>
        )
      })}
      <h2>缺失技能:</h2>
      {result.missing.map((skill) => {
        const candidate = findJdCandidate(lines, skill)

        return (
          <p key={skill}>
            {skill}
            {submittedJD && (
              <span className = "jd-candidate"> · {candidate ? `第 ${candidate.lineNumber} 行 · ${candidate.text}` : "未找到原文候选"}</span>
            )}
          </p>
        )
      })}
      <h2>匹配率:</h2>
      <p className = "match-rate">
        { (result.rate * 100).toFixed(1)
        }%
      </p>
      {submittedJD && (
        <details>
          <summary>本次提交的 JD 原文</summary>
          {lines.map((line, index) => (
            <div key={index} className="jd-source-line">
              第 {index + 1} 行 · {line}
            </div>
          ))}
        </details>
      )}
      </div>
  )
}

export default AnalysisResult