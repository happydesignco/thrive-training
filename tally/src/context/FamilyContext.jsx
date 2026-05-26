import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

const Ctx = createContext(null)

export function FamilyProvider({ children }) {
  const { user } = useAuth()
  const [family, setFamily] = useState(null)
  const [kids, setKids] = useState([])
  const [balances, setBalances] = useState({})  // kid_id -> balance
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const reload = useCallback(async () => {
    if (!user) {
      setFamily(null); setKids([]); setBalances({}); setLoading(false); return
    }
    setLoading(true)
    setError(null)
    try {
      const { data: member, error: memberErr } = await supabase
        .from('family_members').select('family_id').eq('user_id', user.id).maybeSingle()
      if (memberErr) throw memberErr

      if (!member) {
        setFamily(null); setKids([]); setBalances({}); setLoading(false); return
      }

      const { data: fam, error: famErr } = await supabase
        .from('families').select('*').eq('id', member.family_id).single()
      if (famErr) throw famErr
      setFamily(fam)

      const { data: kidRows, error: kidErr } = await supabase
        .from('kids').select('*').eq('family_id', fam.id).eq('archived', false).order('created_at')
      if (kidErr) throw kidErr
      setKids(kidRows ?? [])

      if (kidRows?.length) {
        const ids = kidRows.map((k) => k.id)
        const { data: txns, error: txErr } = await supabase
          .from('transactions').select('kid_id, delta').in('kid_id', ids)
        if (txErr) throw txErr
        const totals = {}
        for (const k of kidRows) totals[k.id] = 0
        for (const r of txns ?? []) totals[r.kid_id] = (totals[r.kid_id] || 0) + r.delta
        setBalances(totals)
      } else {
        setBalances({})
      }
    } catch (e) {
      console.error(e)
      setError(e.message ?? String(e))
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { reload() }, [reload])

  const value = useMemo(() => ({
    family, kids, balances, loading, error, reload,
    needsFamily: !loading && !!user && !family,
  }), [family, kids, balances, loading, error, reload, user])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useFamily() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useFamily outside FamilyProvider')
  return ctx
}
