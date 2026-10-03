import './App.css'
import { useState } from 'react'
import AnalysisResult from './AnalysisResult'
function App() {
  const [skills,setSkills] = useState("") 
  const [requiredSkills,setRequiredSkills] = useState("")
  const [result,setResult] = useState({
    matched:[],
    missing:[],
    rate:0
  })
  const [error,setError]=useState("")
  const [loading,setLoading]=useState(false) 
  const [hasAnalyzed,setHasAnalyzed]=useState(false)

  async function handleAnalyze(){
    const userSkills = skills.split(",").map(skill=>skill.trim()).filter((skill)=>skill !== "")
    const requiredSkillsList = requiredSkills.split(",").map(skill=>skill.trim()).filter((skill)=>skill !== "")
    if(userSkills.length === 0 || requiredSkillsList.length === 0){
      setError("我的技能为空或者岗位要求为空")
      return
    }
    setLoading(true)
        const data = {
          user_skills: userSkills,
          required_skills: requiredSkillsList
        }
        setError("")
        try{
        const response = await fetch(
          "http://127.0.0.1:8000/analyze",
          {
            method: "POST",
            headers: {"Content-Type":"application/json"},
            body: JSON.stringify(data)
          }
        )
        if (!response.ok){
          throw new Error(`HTTP${response.status}`)
        }
        const responseData = await response.json()
        setHasAnalyzed(true)
        setResult(responseData)
      }catch(error){
          setError("分析请求失败，请稍后重试")
        }finally{
          setLoading(false)
        }
      }


  return (
    <div className = "container">
      <h1 className = "page-title">AI Skill Analyzer</h1>
      <div className = "input-row">
      <label>我的技能</label>
      <input
      value={skills}
      onChange = {(event)=>setSkills(event.target.value)}
      />
      </div>
      <div className = "input-row">
      <label>岗位要求</label>
      <input
      value={requiredSkills}
      onChange = {(event) => setRequiredSkills(event.target.value)}
      />
      </div>
      <button className = "analyze-button" onClick={() =>handleAnalyze()} disabled={loading}>
        {loading ? "分析中..." : "开始分析"}
      </button>
      <h2>当前技能:</h2>
      <h3>{skills}</h3>
      <h2>岗位要求:</h2>
      <h3>{requiredSkills}</h3>
      {hasAnalyzed && <AnalysisResult result={result} />}
      <p className = "error-message">{error}</p>
    </div>
    
  )
}

export default App


