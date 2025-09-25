
import React from 'react'

export default function Card({ card, onApprove, onReject }) {
  return (
    <div className="bg-slate-900 p-3 rounded-md shadow-md border border-slate-700">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-base">{card.title}</h3>
          <p className="text-xs text-slate-400">{card.source} • {new Date(card.publishedAt).toLocaleString()}</p>
          <p className="mt-2 text-sm text-slate-300">{card.snippet}</p>
        </div>
        <div className="ml-3 flex flex-col items-end gap-2">
          <div className={`px-2 py-1 rounded text-xs font-medium ${card.verified ? 'bg-emerald-400 text-black' : 'bg-slate-700 text-slate-200'}`}>
            {card.verified ? 'Verified' : 'Unverified'}
          </div>
          <div className="text-xs text-slate-400">Score: {(card.credibilityScore*100).toFixed(0)}%</div>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <button onClick={() => onApprove(card.id)} className="flex-1 px-3 py-2 rounded bg-emerald-500 text-black font-semibold hover:brightness-105">Approve</button>
        <button onClick={() => onReject(card.id)} className="px-3 py-2 rounded bg-rose-600 text-white hover:brightness-105">Reject</button>
      </div>
    </div>
  )
}
