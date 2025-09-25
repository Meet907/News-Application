
import React from 'react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { motion, AnimatePresence } from 'framer-motion';
import Card from './Card'

export default function Column({ column, cards, onApprove, onReject }) {
  return (
    <div className="bg-slate-800 rounded-xl p-3 shadow-xl min-h-[200px]">
      <h2 className="text-lg font-semibold mb-2 flex items-center justify-between">
        {column.title}
        <span className="text-sm text-slate-400">{cards.length}</span>
      </h2>
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div ref={provided.innerRef} {...provided.droppableProps} className={`space-y-3 min-h-[120px] ${snapshot.isDraggingOver ? 'bg-slate-700/40 p-2 rounded' : ''}`}>
            <AnimatePresence>
              {cards.map((card, index) => (
                <Draggable key={card.id} draggableId={card.id} index={index}>
                  {(prov) => (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.18 }}
                      ref={prov.innerRef}
                      {...prov.draggableProps}
                      {...prov.dragHandleProps}
                    >
                      <Card card={card} onApprove={onApprove} onReject={onReject} />
                    </motion.div>
                  )}
                </Draggable>
              ))}
            </AnimatePresence>
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  )
}
