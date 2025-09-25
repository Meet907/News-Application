
import React, { useEffect, useState } from 'react'
import { DragDropContext } from 'react-beautiful-dnd'
import Column from '@/components/Column'
import axios from 'axios'

const INITIAL_BOARD = {
  columns: {
    inbox: { id: 'inbox', title: 'Inbox (Breaking & Incoming)', cardIds: [] },
    tech: { id: 'tech', title: 'Technology', cardIds: [] },
    politics: { id: 'politics', title: 'USA Politics', cardIds: [] },
    trade: { id: 'trade', title: 'Global Trade', cardIds: [] },
    global: { id: 'global', title: 'Global', cardIds: [] },
    ai: { id: 'ai', title: 'AI', cardIds: [] },
    immigration: { id: 'immigration', title: 'USA Immigration', cardIds: [] },
    wealth: { id: 'wealth', title: 'Wealth Building', cardIds: [] },
    approved: { id: 'approved', title: 'Approved', cardIds: [] },
    rejected: { id: 'rejected', title: 'Rejected', cardIds: [] }
  },
  columnOrder: ['inbox','tech','politics','trade','global','ai','immigration','wealth','approved','rejected'],
  cards: {}
}

export default function Kanban() {
  const [board, setBoard] = useState(INITIAL_BOARD)
  const [statusMessage, setStatusMessage] = useState('Ready')

  useEffect(() => {
    fetchAllNews()
    const interval = setInterval(fetchAllNews, 600000) // every 10 min
    return () => clearInterval(interval)
  }, [])

  async function fetchAllNews() {
    setStatusMessage('Fetching news...')
    try {
      const categories = ['technology','politics','trade','global','ai','immigration','wealth']
      const promises = categories.map(c => axios.get(`/api/news?category=${c}`))
      const results = await Promise.all(promises)
      const newCards = {}
      const newBoard = JSON.parse(JSON.stringify(INITIAL_BOARD))

      results.forEach((res, idx) => {
        const category = categories[idx]
        res.data.forEach(article => {
          newCards[article.id] = article
          newBoard.columns[category === 'technology' ? 'tech' : category].cardIds.push(article.id)
        })
      })

      setBoard({ ...newBoard, cards: newCards })
      setStatusMessage('News updated.')
    } catch (e) {
      console.error(e)
      setStatusMessage('Error fetching news.')
    }
  }

  function handleDragEnd(result) {
    const { destination, source, draggableId } = result
    if (!destination) return

    const startCol = board.columns[source.droppableId]
    const finishCol = board.columns[destination.droppableId]

    if (startCol === finishCol) {
      const newCardIds = Array.from(startCol.cardIds)
      newCardIds.splice(source.index, 1)
      newCardIds.splice(destination.index, 0, draggableId)
      const newCol = { ...startCol, cardIds: newCardIds }
      setBoard(prev => ({ ...prev, columns: { ...prev.columns, [newCol.id]: newCol } }))
      return
    }

    const startCardIds = Array.from(startCol.cardIds)
    startCardIds.splice(source.index, 1)
    const newStart = { ...startCol, cardIds: startCardIds }

    const finishCardIds = Array.from(finishCol.cardIds)
    finishCardIds.splice(destination.index, 0, draggableId)
    const newFinish = { ...finishCol, cardIds: finishCardIds }

    setBoard(prev => ({ ...prev, columns: { ...prev.columns, [newStart.id]: newStart, [newFinish.id]: newFinish } }))
  }

  function approveCard(cardId) {
    setBoard(prev => {
      const newApproved = { ...prev.columns.approved, cardIds: [cardId, ...prev.columns.approved.cardIds] }
      return { ...prev, columns: { ...prev.columns, approved: newApproved } }
    })
  }

  function rejectCard(cardId) {
    setBoard(prev => {
      const newRejected = { ...prev.columns.rejected, cardIds: [cardId, ...prev.columns.rejected.cardIds] }
      return { ...prev, columns: { ...prev.columns, rejected: newRejected } }
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-slate-100 p-6">
      <header className="max-w-7xl mx-auto mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight">KanbanNews — Verified Headlines</h1>
        <p className="text-sm text-slate-300">Organize breaking news into categories, approve/reject with workflow.</p>
        <div className="mt-3 text-sm text-slate-300">Status: {statusMessage}</div>
      </header>

      <main className="max-w-7xl mx-auto">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {board.columnOrder.map(colId => {
              const column = board.columns[colId]
              if (!column) return null
              const cards = column.cardIds.map(id => board.cards[id]).filter(Boolean)
              return (
                <Column key={column.id} column={column} cards={cards} onApprove={approveCard} onReject={rejectCard} />
              )
            })}
          </div>
        </DragDropContext>
      </main>

      <footer className="max-w-7xl mx-auto mt-8 text-sm text-slate-400">Demo — fetches news every 10 minutes from NewsAPI + RSS.</footer>
    </div>
  )
}
