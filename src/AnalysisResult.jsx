function AnalysisResult(props){
  const result = props.result
  return (
    <div className = "result-box">
      <h2>匹配技能:</h2>
      {
      result.matched.map((skill)=><p key ={skill}>{skill}</p>)
      }
      <h2>缺失技能:</h2>
      {
      result.missing.map((skill)=><p key = {skill}>{skill}</p>)
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