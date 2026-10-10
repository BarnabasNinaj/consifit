import { useState, type FormEvent } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import type { Exercise } from '../types';
import type { WorkoutStore } from '../hooks/useWorkoutStore';

interface ExerciseEditorProps {
  store: WorkoutStore;
}

/** Compact inline exercise list + add/edit for Settings. */
export function ExerciseEditor({ store }: ExerciseEditorProps) {
  const [name, setName] = useState('');
  const [editing, setEditing] = useState<Exercise | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Exercise | null>(null);

  const resetForm = () => {
    setName('');
    setEditing(null);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (editing) {
      store.editExercise(editing.id, name);
    } else {
      store.addExercise(name);
    }
    resetForm();
  };

  const startEdit = (ex: Exercise) => {
    setEditing(ex);
    setName(ex.name);
  };

  return (
    <div className="relative space-y-2">
      <form onSubmit={handleSubmit} className="flex gap-1.5">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={editing ? 'Rename exercise' : 'New exercise'}
          className="min-h-10 min-w-0 flex-1 rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-emerald-500/40 focus:outline-none"
        />
        <button
          type="submit"
          className="flex min-h-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500 px-3 text-xs font-semibold text-zinc-950 active:bg-emerald-400"
        >
          {editing ? 'Save' : 'Add'}
        </button>
        {editing && (
          <button
            type="button"
            onClick={resetForm}
            className="min-h-10 shrink-0 rounded-lg px-2.5 text-xs text-zinc-500 ring-1 ring-zinc-800"
          >
            Cancel
          </button>
        )}
      </form>

      <ul className="space-y-1">
        {store.data.exercises.map((ex) => (
          <li
            key={ex.id}
            className="flex items-center gap-1.5 rounded-lg bg-zinc-900/60 px-2 py-1.5 ring-1 ring-zinc-800/80"
          >
            <p className="min-w-0 flex-1 truncate text-sm font-medium text-zinc-100">
              {ex.name}
            </p>
            <button
              type="button"
              onClick={() => startEdit(ex)}
              className="rounded-md p-2 text-zinc-500 active:bg-zinc-800 active:text-zinc-200"
              aria-label="Edit"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(ex)}
              className="rounded-md p-2 text-zinc-500 active:bg-zinc-800 active:text-rose-400"
              aria-label="Delete"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </li>
        ))}
        {store.data.exercises.length === 0 && (
          <p className="py-2 text-center text-xs text-zinc-600">
            No exercises yet.
          </p>
        )}
      </ul>

      {confirmDelete && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-black/75 p-3">
          <div className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-3">
            <p className="text-sm font-semibold text-zinc-50">Delete?</p>
            <p className="mt-1 text-xs text-zinc-400">
              Removes{' '}
              <span className="text-zinc-200">{confirmDelete.name}</span> and its
              history.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="min-h-10 rounded-lg bg-zinc-800 text-xs font-semibold text-zinc-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  store.deleteExercise(confirmDelete.id);
                  if (editing?.id === confirmDelete.id) resetForm();
                  setConfirmDelete(null);
                }}
                className="min-h-10 rounded-lg bg-rose-600 text-xs font-semibold text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
