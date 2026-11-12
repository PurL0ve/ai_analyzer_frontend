import './App.css'
import { useState } from 'react'
import AnalysisResult from './AnalysisResult'
import { findJdCandidate } from "./jdCandidates"

function App() {
  const [skills, setSkills] = useState("")
  const [requiredSkills, setRequiredSkills] = useState("")
  const [position, setPosition] = useState("")
  const [histories, setHistories] = useState([])
  const [result, setResult] = useState({
    matched: [],
    missing: [],
    rate: 0
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [hasAnalyzed, setHasAnalyzed] = useState(false)
  const [historyError, setHistoryError] = useState("")
  const [hasLoadedHistory, setHasLoadedHistory] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [jd, setJd] = useState("")
  const [originalExtractedSkills, setOriginalExtractedSkills] = useState(null)

  async function handleAnalyze() {
    const userSkills = skills
      .split(",")
      .map(skill => skill.trim())
      .filter((skill) => skill !== "")

    const requiredSkillsList = requiredSkills
      .split(",")
      .map(skill => skill.trim())
      .filter((skill) => skill !== "")

    if (
      userSkills.length === 0 ||
      requiredSkillsList.length === 0 ||
      position.trim() === ""
    ) {
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

    try {
      const response = await fetch("http://127.0.0.1:8000/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      })

      console.log(
        "HTTP状态码：",
        response.status,
        "是否成功：",
        response.ok
      )

      if (!response.ok) {
        throw new Error(`HTTP${response.status}`)
      }

      const responseData = await response.json()

      setHasAnalyzed(true)
      setResult(responseData.data)
    } catch (error) {
      setError("分析请求失败，请稍后重试")
      setHasAnalyzed(false)
    } finally {
      setLoading(false)
    }
  }
  async function handleAnalyzeJD(){
    const userSkills = skills
      .split(",")
      .map(skill => skill.trim())
      .filter(skill => skill !== "")
    if (jd.trim() === "" || userSkills.length === 0) {
      setError("请填写我的技能和岗位描述")
      setHasAnalyzed(false)
      return
    }
    if(position.trim() === ""){
      setError("请填写岗位名称")
      setHasAnalyzed(false)
      return
    }
    setHasAnalyzed(false)
    setLoading(true)
    setError("")

    try{
      const response = await fetch("http://127.0.0.1:8000/analyze-jd",{
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          user_skills: userSkills,
          jd: jd,
          position: position
        },
        )
      }
      )

      if(!response.ok){
        const errorData = await response.json()
        const message = errorData.detail
        if(typeof message === "string" && message.trim() !== "")
          setError(message)
        else
          setError("JD分析请求失败，请稍后重试")
        return
      }

      const responseData = await response.json()

      setHasAnalyzed(true)
      setResult({
        ...responseData.data,
        submittedJD:jd
      })
  }catch(error){
    setError("JD分析请求失败，请稍后重试")
    setHasAnalyzed(false)
  } finally{
    setLoading(false)
  }
  }
  async function handleLoadHistory() {
    setHistoryError("")
    setHistoryLoading(true)

    try {
      const response = await fetch("http://127.0.0.1:8000/history")

      if (!response.ok) {
        throw new Error(`HTTP${response.status}`)
      }

      const responseData = await response.json()

      setHistories(responseData.data)
      setHasLoadedHistory(true)
      setShowHistory(true)
    } catch (error) {
      setHistoryError("加载历史记录失败，请稍后重试")
      console.error("加载历史记录失败:", error)
    } finally {
      setHistoryLoading(false)
    }
  }
  async function handleExtractJD() {
    if (jd.trim() === "") {
      setError("请填写岗位描述")
      return
    }

    setError("")
    setHasAnalyzed(false)
    setLoading(true)

    try {
      const response = await fetch("http://127.0.0.1:8000/extract-jd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jd })
      })
      const responseData = await response.json()

      if (!response.ok) {
        const detail = responseData.detail
        setError(typeof detail === "string" && detail.trim() !== ""
          ? detail
          : "技能提取失败，请稍后重试")
        return
      }

      const extractedSkills = responseData.data.required_skills
      setOriginalExtractedSkills(extractedSkills)
      setRequiredSkills(extractedSkills.join(","))
      if (extractedSkills.length === 0) {
        setError("未提取到技能，请手动填写岗位要求")
      }
    } catch {
      setError("技能提取请求失败，请稍后重试")
    } finally {
      setLoading(false)
    }
  }
  const jdLines = jd.split(/\r?\n/)

  const addedSkills = []
  const removedSkills = []

  if (originalExtractedSkills !== null) {
    const originalKeys = new Set()
    const currentKeys = new Set()
    const addedKeys = new Set()
    const removedKeys = new Set()

      // 1. 用真实的原始提取结果建集合
    for (const item of originalExtractedSkills) {
      const name = item.trim()
      if (name === "") continue

      originalKeys.add(name.toLowerCase())
    }

    // 2. 算新增，同时记下当前输入的所有有效技能
    const items = requiredSkills.split(",")

    for (const item of items) {
      const name = item.trim()
      if (name === "") continue

      const key = name.toLowerCase()
      currentKeys.add(key)

      if (!originalKeys.has(key) && !addedKeys.has(key)) {
        addedSkills.push(name)
        addedKeys.add(key)
      }
    }

     // 3. 算移除，用上一段填好的 currentKeys 查找
    for (const item of originalExtractedSkills) {
      const name = item.trim()
      if (name === "") continue

      const key = name.toLowerCase()

      if (!currentKeys.has(key) && !removedKeys.has(key)) {
        removedSkills.push(name)
        removedKeys.add(key)
      }
    }
  }

  return (
    <div className="container">
      <h1 className="page-title">AI Skill Analyzer</h1>

      <div className="input-row">
        <label>岗位名称</label>
        <input
          value={position}
          onChange={(event) => {
            setPosition(event.target.value)
            setHasAnalyzed(false)
          }}
          disabled={loading}
        />
      </div>

      <div className="input-row">
        <label>我的技能</label>
        <input
          value={skills}
          onChange={(event) => {
            setSkills(event.target.value)
            setHasAnalyzed(false)
          }}
          disabled={loading}
        />
      </div>

      <div className="input-row">
        <label>岗位描述</label>
        <textarea placeholder="粘贴岗位描述" 
          value={jd}
          onChange={(event) => {
            setJd(event.target.value)
            setOriginalExtractedSkills(null)
            setHasAnalyzed(false)
          }
          }
          disabled={loading}
        />
      </div>

      <div className="input-row">
        <label>岗位要求</label>
        <input
          value={requiredSkills}
          onChange={(event) => {
            setRequiredSkills(event.target.value)
            setHasAnalyzed(false)
          }}
          disabled={loading}
        />
      </div>
      
      {originalExtractedSkills !== null && (
        <div>
          <p>原始提取技能</p>
          {originalExtractedSkills.length === 0 && <p>未提取到技能</p>}

          {originalExtractedSkills.map((skill, index) => {
            const candidate = findJdCandidate(jdLines, skill)

            return (
              <p key={index}>
                {skill}
                <span className="jd-candidate">
                  {" · "}{candidate ? `第 ${candidate.lineNumber} 行 · ${candidate.text}` : "未找到原文候选"}
                </span>
              </p>
            )
          })}
          <p>新增技能：{addedSkills.length > 0 ? addedSkills.join("、") : "无"}</p>
          <p>移除技能：{removedSkills.length > 0 ? removedSkills.join("、") : "无"}</p>
        </div>
      )}

      <button
        className="analyze-button"
        onClick={() => handleAnalyze()}
        disabled={loading}
      >
        {loading ? "分析中..." : "开始分析"}
      </button>
      
      <button
        className="analyze-button"
        onClick={() => handleAnalyzeJD()}
        disabled={loading}
      >
        {loading ? "分析中.." : "从JD分析"}
      </button>

      <button
        type="button"
        className="analyze-button"
        onClick={handleExtractJD}
        disabled={loading}
      >
        先提取技能
      </button>

      <p className="error-message">{error}</p>

      {hasAnalyzed && <AnalysisResult result={result} />}
      {hasAnalyzed && result.submittedJD &&
  (result.matched.length + result.missing.length > 0) && (
    <button type="button" onClick={() => setRequiredSkills(result.matched.concat(result.missing).join(","))}>
      将提取技能填入岗位要求
    </button>
  )}
      <section className="history-section">
        <h2>历史记录</h2>

        <button
          className="history-button"
          onClick={() => handleLoadHistory()}
          disabled={historyLoading}
        >
          {historyLoading ? "加载中..." : "加载历史"}
        </button>

        {hasLoadedHistory && (
          <button
            className="history-button"
            onClick={() => setShowHistory(!showHistory)}
          >
            {showHistory ? "收起历史" : "展开历史"}
          </button>
        )}

        <p className="error-message">{historyError}</p>

        {showHistory && hasLoadedHistory && (
          <div>
            <p>已加载历史记录：{histories.length} 条</p>

            {histories.length === 0 && <p>暂无历史记录</p>}

            <ul>
              {histories.map((history, index) => (
                <li key={history.id}>
                  {history.position}-{(history.rate * 100).toFixed(1)}%
                  -(编号：{index + 1})
                  来源:{history.source === "manual" ? "手动输入分析" : history.source === "jd" ? "JD提取分析" : "历史未标记"}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  )
}

export default App