import './App.css'
import { useState } from 'react'
import AnalysisResult from './AnalysisResult'
function App() {
  const [skills,setSkills] = useState("") 
  const [requiredSkills,setRequiredSkills] = useState("")
  const [position,setPosition] = useState("")
  const [histories,setHistories] = useState([])
  const [result,setResult] = useState({
    matched:[],
    missing:[],
    rate:0
  })
  const [error,setError]=useState("")
  const [loading,setLoading]=useState(false) 
  const [hasAnalyzed,setHasAnalyzed]=useState(false)
  const [historyError,setHistoryError]=useState("")
  const [hasLoadedHistory,setHasLoadedHistory]=useState(false)
  const [historyLoading,setHistoryLoading]=useState(false)

  async function handleAnalyze(){
    const userSkills = skills.split(",").map(skill=>skill.trim()).filter((skill)=>skill !== "")
    const requiredSkillsList = requiredSkills.split(",").map(skill=>skill.trim()).filter((skill)=>skill !== "")
    if(userSkills.length === 0 || requiredSkillsList.length === 0 || position.trim() === ""){
      setError("请填写岗位名称、我的技能和岗位要求")
      setHasAnalyzed(false)
      return
    }
    setHasAnalyzed(false)
    setLoading(true)
        const data = {
          user_skills: userSkills,
          required_skills: requiredSkillsList,
          position: position
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
        console.log("HTTP状态码：", response.status, "是否成功：", response.ok)
        if (!response.ok){
          throw new Error(`HTTP${response.status}`)
        }
        const responseData = await response.json()
        setHasAnalyzed(true)
        setResult(responseData.data)
      }catch(error){
          setError("分析请求失败，请稍后重试")
          setHasAnalyzed(false)
        }finally{
          setLoading(false)
        }
      }
  async function handleLoadHistory(){
    setHistoryError("")
    setHistoryLoading(true)
    try{
      const response = await fetch("http://127.0.0.1:8000/history")
      if(!response.ok){
        throw new Error(`HTTP${response.status}`)
      }
      const responseData = await response.json()
      setHistories(responseData.data)
      setHasLoadedHistory(true)
    }catch(error){
      setHistoryError("加载历史记录失败，请稍后重试")
      console.error("加载历史记录失败:", error)
    }finally{
      setHistoryLoading(false)
    }
  }


  return (
    <div className = "container">
      <h1 className = "page-title">AI Skill Analyzer</h1>
      <div className = "input-row">
      <label>岗位名称</label>
      <input
      value = {position}
      onChange = {(event) => {
        setPosition(event.target.value)
        setHasAnalyzed(false)
      }}
      disabled={loading}
      />
      </div>
      <div className = "input-row">
      <label>我的技能</label>
      <input
      value={skills}
      onChange = {(event)=>{
        setSkills(event.target.value)
        setHasAnalyzed(false)
      }}
      disabled={loading}
      />
      </div>
      <div className = "input-row">
      <label>岗位要求</label>
      <input
      value={requiredSkills}
      onChange = {(event) => {
        setRequiredSkills(event.target.value)
        setHasAnalyzed(false)
      }}
      disabled={loading}
      />
      </div>
      <button className = "analyze-button" onClick={() =>handleAnalyze()} disabled={loading}>
        {loading ? "分析中..." : "开始分析"}
      </button>
      <p className = "error-message">{error}</p>
      {hasAnalyzed && <AnalysisResult result={result} />}
      <section className = "history-section">
        <h2>历史记录</h2>
      <button className = "history-button" onClick = {() => handleLoadHistory()} disabled={historyLoading}>
        {historyLoading ? "加载中..." : "加载历史"}
      </button>
      <p className = "error-message">{historyError}</p>
      {hasLoadedHistory && <p>已加载历史记录：{histories.length} 条</p>}
      {hasLoadedHistory && histories.length === 0 && <p>暂无历史记录</p>}
      <ul>
        {histories.map((history) => (
        <li key = {history.id}>
          {history.position}-{(history.rate * 100).toFixed(1)}%-(编号：{history.id})
        </li> 
        ))}
      </ul>
      </section>
    </div>
    
  )
}

export default App


