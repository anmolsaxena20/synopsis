import { createContext, useContext, useState, useEffect } from "react"

const CreditContext = createContext()

export function CreditProvider({ children }) {

  const [credits, setCredits] = useState(() => {
    const saved = localStorage.getItem("credits")
    return saved ? Number(saved) : 3
  })

  useEffect(() => {
    localStorage.setItem("credits", credits)
  }, [credits])

  function decreaseCredit() {
    setCredits(c => Math.max(0, c - 1))
  }

  function addCredits(amount) {
    setCredits(c => c + amount)
  }

  return (
    <CreditContext.Provider value={{ credits, decreaseCredit, addCredits }}>
      {children}
    </CreditContext.Provider>
  )
}

export function useCredits() {
  return useContext(CreditContext)
}