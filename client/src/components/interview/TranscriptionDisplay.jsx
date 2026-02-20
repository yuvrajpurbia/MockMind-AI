import { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit2, Check, X } from 'lucide-react';

export default function TranscriptionDisplay({ transcript, onEdit, editable = true }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(transcript);

  const handleSave = () => {
    if (onEdit) {
      onEdit(editedText);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedText(transcript);
    setIsEditing(false);
  };

  if (!transcript && !editedText) return null;

  return (
    <motion.div
      className="glass-morphism rounded-2xl p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-bold text-cyber-blue flex items-center gap-2">
          <span>📝</span> Your Answer
        </h4>

        {editable && !isEditing && (
          <motion.button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg glass-effect border border-cyber-blue/30 text-cyber-blue hover:border-cyber-blue transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Edit2 className="w-4 h-4" />
            <span className="text-sm font-medium">Edit</span>
          </motion.button>
        )}
      </div>

      {/* Transcription Content */}
      {isEditing ? (
        <div className="space-y-4">
          <textarea
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            className="w-full min-h-[200px] bg-cyber-darker/50 rounded-xl p-4 text-white leading-relaxed border-2 border-cyber-blue focus:border-cyber-purple focus:outline-none transition-all resize-none"
            placeholder="Type or edit your answer here..."
            autoFocus
          />

          {/* Edit Controls */}
          <div className="flex gap-3 justify-end">
            <motion.button
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2 rounded-lg glass-effect border border-gray-500 text-gray-300 hover:border-gray-400 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <X className="w-4 h-4" />
              <span className="font-medium">Cancel</span>
            </motion.button>

            <motion.button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyber-blue to-cyber-purple text-white font-medium hover:from-cyber-purple hover:to-cyber-blue transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Check className="w-4 h-4" />
              <span>Save Changes</span>
            </motion.button>
          </div>
        </div>
      ) : (
        <div className="bg-cyber-darker/50 rounded-xl p-4 border-l-4 border-cyber-accent">
          <p className="text-white leading-relaxed whitespace-pre-wrap">
            {editedText || transcript}
          </p>

          {/* Word count */}
          <div className="mt-3 pt-3 border-t border-cyber-gray/30">
            <p className="text-sm text-gray-400">
              Word count: <span className="text-cyber-blue font-semibold">
                {(editedText || transcript).trim().split(/\s+/).length}
              </span>
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
}
