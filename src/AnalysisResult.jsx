function AnalysisResult(props){
  const result = props.result
  const submittedJD = result.submittedJD
  let lines = []

  if (submittedJD) {
    lines = submittedJD.split(/\r?\n/)
  }

  function findCandidate(skill) {
    return lines.find((line) =>
      line.toLowerCase().includes(skill.toLowerCase())
    )
  }
  return (
    <div className = "result-box">
      <h2>匹配技能:</h2>
      {
      result.matched.map((skill)=><p key ={skill}>
        {skill}
        {submittedJD && <span>{findCandidate(skill) || "未找到原文候选"}</span>}
      </p>)
      }
      <h2>缺失技能:</h2>
      {
      result.missing.map((skill)=><p key = {skill}>
        {skill}
        {submittedJD && <span>{findCandidate(skill) || "未找到原文候选"}</span>}
      </p>)
      }
      <h2>匹配率:</h2>
      <p className = "match-rate">
        { (result.rate * 100).toFixed(1)
        }%
      </p>
      </div>
  )
}

export default AnalysisResult