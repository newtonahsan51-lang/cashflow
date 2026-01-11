
import React, { useState } from 'react';
import { SyncData, Note } from '../types';

interface NotesProps {
  data: SyncData;
  onUpdate: (newData: Partial<SyncData>) => void;
  t: any;
}

const Notes: React.FC<NotesProps> = ({ data, onUpdate, t }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteType, setNoteType] = useState<'text' | 'list'>('text');
  const [listItems, setListItems] = useState<{ id: string, text: string, completed: boolean }[]>([]);
  const [currentItemInput, setCurrentItemInput] = useState('');
  const [voiceStatus, setVoiceStatus] = useState<{field: string | null, status: 'idle' | 'listening' | 'success' | 'error', message?: string}>({field: null, status: 'idle'});
  
  const [newNote, setNewNote] = useState<Partial<Note>>({
    title: '',
    content: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleVoiceInput = (field: 'title' | 'content') => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("ভয়েস ইনপুট সাপোর্ট করে না।");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'bn-BD';
    
    recognition.onstart = () => {
      setVoiceStatus({field, status: 'listening', message: 'শুনছি...'});
    };
    
    recognition.onerror = () => {
      setVoiceStatus({field, status: 'error', message: 'আবার চেষ্টা করুন'});
      setTimeout(() => setVoiceStatus({field: null, status: 'idle'}), 2000);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setNewNote(prev => ({ 
        ...prev, 
        [field]: (prev[field as keyof Partial<Note>] || '') + ' ' + transcript 
      }));
      setVoiceStatus({field, status: 'success', message: 'শোনা শেষ'});
      setTimeout(() => setVoiceStatus({field: null, status: 'idle'}), 2000);
    };

    recognition.start();
  };

  const handleAddListItem = () => {
    if (!currentItemInput.trim()) return;
    setListItems([...listItems, { id: Date.now().toString(), text: currentItemInput.trim(), completed: false }]);
    setCurrentItemInput('');
  };

  const removeListItem = (id: string) => {
    setListItems(listItems.filter(item => item.id !== id));
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.title) return;
    
    if (editingNoteId) {
      const updatedNotes = data.notes.map(n => {
        if (n.id === editingNoteId) {
          return {
            ...n,
            title: newNote.title!,
            content: noteType === 'text' ? newNote.content! : '',
            date: newNote.date || new Date().toISOString().split('T')[0],
            type: noteType,
            items: noteType === 'list' ? listItems : undefined
          };
        }
        return n;
      });
      onUpdate({ notes: updatedNotes });
    } else {
      const note: Note = {
        id: Math.random().toString(36).substr(2, 9),
        title: newNote.title!,
        content: noteType === 'text' ? newNote.content! : '',
        date: newNote.date || new Date().toISOString().split('T')[0],
        type: noteType,
        items: noteType === 'list' ? listItems : undefined
      };
      onUpdate({ notes: [note, ...(data.notes || [])] });
    }
    closeAndReset();
  };

  const handleEdit = (note: Note) => {
    setEditingNoteId(note.id);
    setNewNote({
      title: note.title,
      content: note.content,
      date: note.date
    });
    setNoteType(note.type);
    setListItems(note.items || []);
    setIsModalOpen(true);
  };

  const closeAndReset = () => {
    setIsModalOpen(false);
    setEditingNoteId(null);
    setNewNote({ title: '', content: '', date: new Date().toISOString().split('T')[0] });
    setNoteType('text');
    setListItems([]);
    setCurrentItemInput('');
  };

  const handleDelete = (id: string) => {
    if (window.confirm(t.deleteConfirm)) {
      onUpdate({ notes: data.notes.filter(n => n.id !== id) });
    }
  };

  const toggleItemCompletion = (noteId: string, itemId: string) => {
    const updatedNotes = data.notes.map(note => {
      if (note.id === noteId && note.items) {
        return {
          ...note,
          items: note.items.map(item => 
            item.id === itemId ? { ...item, completed: !item.completed } : item
          )
        };
      }
      return note;
    });
    onUpdate({ notes: updatedNotes });
  };

  const filteredNotes = (data.notes || []).filter(note => 
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4 animate-in fade-in pb-10 px-1">
      <div className="flex justify-between items-center px-1">
        <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">আমার নোটসমূহ</h3>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center text-white shadow-lg active:scale-90 transition-transform"
        >
          <i className="fa-solid fa-plus"></i>
        </button>
      </div>

      <div className="sticky top-0 z-10 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md pt-1 pb-2">
        <div className="relative">
          <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"></i>
          <input 
            type="text"
            placeholder="নোট খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 pl-11 rounded-2xl font-bold text-sm shadow-sm outline-none focus:ring-2 ring-blue-100 transition-all dark:text-white"
          />
        </div>
      </div>

      <div className="grid gap-3">
        {filteredNotes.length > 0 ? (
          filteredNotes.map((note) => (
            <div key={note.id} className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm transition-all group active:scale-[0.98]">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-[10px] ${note.type === 'list' ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600'}`}>
                    <i className={`fa-solid ${note.type === 'list' ? 'fa-list-check' : 'fa-note-sticky'}`}></i>
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-slate-100 leading-tight">{note.title}</h4>
                    <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tighter mt-0.5">
                      {new Date(note.date).toLocaleDateString('bn-BD')}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(note)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-blue-500 transition-colors">
                    <i className="fa-solid fa-pen text-[10px]"></i>
                  </button>
                  <button onClick={() => handleDelete(note.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-red-500 transition-colors">
                    <i className="fa-solid fa-trash text-[10px]"></i>
                  </button>
                </div>
              </div>
              
              <div className="pl-12">
                {note.type === 'list' && note.items ? (
                  <div className="space-y-1.5 mt-2">
                    {note.items.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex items-center gap-2" onClick={(e) => { e.stopPropagation(); toggleItemCompletion(note.id, item.id); }}>
                        <i className={`fa-regular ${item.completed ? 'fa-square-check text-green-500' : 'fa-square text-slate-300'} text-xs`}></i>
                        <span className={`text-xs font-medium ${item.completed ? 'text-slate-300 line-through' : 'text-slate-600 dark:text-slate-400'}`}>
                          {item.text}
                        </span>
                      </div>
                    ))}
                    {note.items.length > 3 && <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest mt-1">+{note.items.length - 3} আরও</p>}
                  </div>
                ) : (
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed line-clamp-2">
                    {note.content}
                  </p>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center text-slate-300">
            <i className="fa-solid fa-pen-nib text-5xl mb-4 opacity-20 block"></i>
            <p className="text-xs font-bold uppercase tracking-widest">কোনো নোট পাওয়া যায়নি</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end bg-slate-900/40 backdrop-blur-sm p-3">
          <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-6 pb-10 shadow-2xl animate-in slide-in-from-bottom-full w-full max-w-lg mx-auto safe-area-bottom overflow-y-auto max-h-[90vh]">
            <div className="w-12 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full mx-auto mb-8" onClick={closeAndReset}></div>
            
            <form onSubmit={handleSaveNote} className="space-y-5">
              <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl mb-4">
                <button type="button" onClick={() => setNoteType('text')} className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${noteType === 'text' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400'}`}>লিখুন</button>
                <button type="button" onClick={() => setNoteType('list')} className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${noteType === 'list' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400'}`}>লিস্ট</button>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">নোটের নাম</label>
                <div className="relative">
                  <input 
                    type="text" required value={newNote.title} 
                    onChange={e => setNewNote({...newNote, title: e.target.value})} 
                    className="w-full bg-slate-50 dark:bg-slate-900 p-4 pr-12 rounded-xl font-bold text-sm outline-none dark:text-white" 
                    placeholder="যেমন: আজকের চিন্তা" 
                  />
                  <button 
                    type="button" onClick={() => handleVoiceInput('title')}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center transition-all ${voiceStatus.field === 'title' ? 'bg-blue-600 text-white animate-pulse' : 'text-slate-400 dark:text-slate-600 hover:bg-slate-200'}`}
                  >
                    <i className="fa-solid fa-microphone"></i>
                  </button>
                </div>
              </div>

              {noteType === 'text' ? (
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">বিস্তারিত</label>
                  <div className="relative">
                    <textarea 
                      required value={newNote.content} 
                      onChange={e => setNewNote({...newNote, content: e.target.value})} 
                      className="w-full bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl font-medium text-sm outline-none dark:text-white h-32 resize-none" 
                      placeholder="এখানে লিখুন..."
                    />
                    <button 
                      type="button" onClick={() => handleVoiceInput('content')}
                      className={`absolute right-3 bottom-3 w-9 h-9 rounded-xl flex items-center justify-center transition-all ${voiceStatus.field === 'content' ? 'bg-blue-600 text-white animate-pulse shadow-lg' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}
                    >
                      <i className="fa-solid fa-microphone"></i>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">আইটেম যুক্ত করুন</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" value={currentItemInput}
                      onChange={(e) => setCurrentItemInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddListItem())}
                      className="flex-1 bg-slate-50 dark:bg-slate-900 p-4 rounded-xl font-bold text-sm outline-none dark:text-white" 
                      placeholder="নতুন আইটেম..."
                    />
                    <button type="button" onClick={handleAddListItem} className="w-14 h-14 gradient-bg text-white rounded-xl flex items-center justify-center shadow-lg active:scale-90 transition-transform">
                      <i className="fa-solid fa-plus"></i>
                    </button>
                  </div>
                  
                  <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar p-1">
                    {listItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 animate-in slide-in-from-left-2">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{item.text}</span>
                        <button type="button" onClick={() => removeListItem(item.id)} className="text-red-400 w-8 h-8 rounded-lg hover:bg-red-50 transition-colors">
                          <i className="fa-solid fa-xmark"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeAndReset} className="flex-1 py-4 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 font-black rounded-2xl uppercase text-xs">বাতিল</button>
                <button type="submit" className="flex-[2] py-4 gradient-bg text-white font-black rounded-2xl shadow-xl active:scale-95 transition-all uppercase text-xs">সেভ করুন</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notes;
