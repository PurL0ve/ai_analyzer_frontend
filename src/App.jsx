import './App.css'
import { useState } from 'react'
function App() {
  const [skills,setSkills] = useState("") 
  const [requiredSkills,setRequiredSkills] = useState("")
  const [result,setResult] = useState({
    matched:[],
    missing:[],
    rate:0
  })
  const [error,setError]=useState("")
  return (
    <div>
      <h1>AI Skill Analyzer</h1>
      <div>
      <label>我的技能</label>
      <input 
      onChange = {(event)=>setSkills(event.target.value)}
      />
      </div>
      <div>
      <label>岗位要求</label>
      <input 
      onChange = {(event) => setRequiredSkills(event.target.value)}
      />
      </div>
      <button onClick={async() => {
        const data = {
          user_skills: skills.split(","),
          required_skills: requiredSkills.split(",")
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
        setResult(responseData)}
        catch(error){
          setError("分析请求失败，请稍后重试")
        }
      }
    }
        >开始分析</button>
      <h1>当前技能:</h1>
      <h1>{skills}</h1>
      <h1>岗位要求:</h1>
      <h1>{requiredSkills}</h1>
      <h2>匹配技能:</h2>
      {
        result.matched.map((skill)=><p key={skill}>{skill}</p>)
      }
      <h2>缺失技能:</h2>
      {
        result.missing.map((skill)=><p key={skill}>{skill}</p>)
      }
      <h2>匹配率:</h2>
      {
        (result.rate*100).toFixed(1)
      }%
      <p>{error}</p>
    </div>
    
  )
}

export default App


