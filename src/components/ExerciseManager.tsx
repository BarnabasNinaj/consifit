import { useState, type FormEvent } from 'react';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
import type { Exercise, ExerciseCategory } from '../types';
import type { WorkoutStore } from '../hooks/useWorkoutStore';
import { PageTitle } from './PageTitle';
import { Sheet } from './Sheet';

const CATEGORIES: ExerciseCategory[] = ['Pull', 'Core'];

interface ExerciseManagerProps {
  open: boolean;
  store: WorkoutStore;
  onClose: () => void;
}

export function ExerciseManager({ open, store, onClose }: ExerciseManagerProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ExerciseCategory>('Pull');
  const [editing, setEditing] = useState<Exercise | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Exercise | null>(null);

  const resetForm = () => {
    setName('');
    setCategory('Pull');
    setEditing(null);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (editing) {
      store.editExercise(editing.id, name, category);
    } else {
      store.addExercise(name, category);
    }
    resetForm();
  };

  const startEdit = (ex: Exercise) => {
    setEditing(ex);
    setName(ex.name);
    setCategory(ex.category);
  };

  return (
    <Sheet open={open} onClose={onClose} height={0.9}>
      <div className="flex min-h-0 flex-1 flex-col px-5 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <PageTitle
          title="Exercises"
          subtitle="Add, edit, or delete your queue."
          action={
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-zinc-900 p-2.5 text-zinc-400"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          }
        />

        <form
          onSubmit={handleSubmit}
          className="mb-4 shrink-0 space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-3"
        >
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Exercise name"
            className="min-h-12 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 text-base text-zinc-100 placeholder:text-zinc-600 focus:border-emerald-500/40 focus:outline-none"
          />
          <div className="flex gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`min-h-11 flex-1 rounded-xl text-sm font-medium ${
                  category === cat
                    ? 'bg-emerald-600 text-white'
                    : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                {cat}
              </button>
            ))}
            <input
              type="text"
              value={CATEGORIES.includes(category) ? '' : category}
              onChange={(e) => setCategory(e.target.value || 'Pull')}
              placeholder="Other"
              className="min-h-11 w-24 rounded-xl border border-zinc-800 bg-zinc-950 px-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-semibold text-white"
            >
              <Plus className="h-4 w-4" />
              {editing ? 'Save Changes' : 'Add Exercise'}
            </button>
            {editing && (
              <button
                type="button"
                onClick={resetForm}
                className="min-h-12 rounded-xl bg-zinc-800 px-4 text-sm text-zinc-300"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain pb-2">
          {store.data.exercises.map((ex) => (
            <li
              key={ex.id}
              className="flex items-center gap-2 rounded-2xl border border-zinc-800/80 bg-zinc-900/60 px-3 py-3"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-zinc-100">{ex.name}</p>
                <p className="text-xs text-zinc-500">{ex.category}</p>
              </div>
              <button
                type="button"
                onClick={() => startEdit(ex)}
                className="rounded-xl p-3 text-zinc-400 active:bg-zinc-800"
                aria-label="Edit"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(ex)}
                className="rounded-xl p-3 text-zinc-400 active:bg-zinc-800 active:text-rose-400"
                aria-label="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      </div>

      {confirmDelete && (
        <div className="absolute inset-0 z-10 flex items-end bg-black/70 px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-8 sm:items-center sm:justify-center">
          <div className="w-full max-w-sm rounded-2xl border border-zinc-700 bg-zinc-900 p-5">
            <h3 className="text-lg font-semibold text-zinc-50">Delete exercise?</h3>
            <p className="mt-2 text-sm text-zinc-400">
              This permanently removes{' '}
              <span className="font-medium text-zinc-200">{confirmDelete.name}</span>{' '}
              and all of its workout history.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="min-h-12 rounded-xl bg-zinc-800 text-sm font-semibold text-zinc-200"
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
                className="min-h-12 rounded-xl bg-rose-600 text-sm font-semibold text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </Sheet>
  );
}
