import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Save, Plus, Trash2, FileText, HelpCircle, ChevronRight } from 'lucide-react';
import { ReadingBook, ReadingTest, ReadingPassage, ReadingQuestion } from '../../types';
import { cn } from '../../utils';

interface ReadingTestEditorProps {
  book: ReadingBook;
  onSave: (updatedBook: ReadingBook) => void;
  onCancel: () => void;
}

export const ReadingTestEditor: React.FC<ReadingTestEditorProps> = ({ book, onSave, onCancel }) => {
  const [activeTestId, setActiveTestId] = useState<string>(book.tests[0]?.id || 'test-1');
  const [activePassageId, setActivePassageId] = useState<string>('passage-1');
  
  // Initialize state with existing data or defaults
  const [currentPassage, setCurrentPassage] = useState<ReadingPassage>(() => {
    const test = book.tests.find(t => t.id === activeTestId) || { id: 'test-1', title: 'Test 1', passages: [] };
    const passage = test.passages.find(p => p.id === activePassageId) || { 
      id: 'passage-1', 
      title: '', 
      content: '', 
      questions: [] 
    };
    return passage;
  });

  const handleSavePassage = () => {
    // 1. Find or create the test
    let updatedTests = [...book.tests];
    let testIndex = updatedTests.findIndex(t => t.id === activeTestId);
    
    if (testIndex === -1) {
      updatedTests.push({
        id: activeTestId,
        title: `Test ${activeTestId.split('-')[1]}`,
        passages: []
      });
      testIndex = updatedTests.length - 1;
    }

    // 2. Update the passage in the test
    let updatedPassages = [...updatedTests[testIndex].passages];
    const passageIndex = updatedPassages.findIndex(p => p.id === activePassageId);

    if (passageIndex > -1) {
      updatedPassages[passageIndex] = currentPassage;
    } else {
      updatedPassages.push(currentPassage);
    }

    updatedTests[testIndex] = {
      ...updatedTests[testIndex],
      passages: updatedPassages
    };

    // 3. Save the book
    onSave({
      ...book,
      tests: updatedTests
    });
    
    alert('Passage saved successfully!');
  };

  const handleAddQuestion = () => {
    const newQuestion: ReadingQuestion = {
      id: Date.now().toString(),
      text: '',
      type: 'text',
      correctAnswer: ''
    };
    setCurrentPassage({
      ...currentPassage,
      questions: [...currentPassage.questions, newQuestion]
    });
  };

  const updateQuestion = (id: string, field: keyof ReadingQuestion, value: any) => {
    setCurrentPassage({
      ...currentPassage,
      questions: currentPassage.questions.map(q => 
        q.id === id ? { ...q, [field]: value } : q
      )
    });
  };

  const deleteQuestion = (id: string) => {
    setCurrentPassage({
      ...currentPassage,
      questions: currentPassage.questions.filter(q => q.id !== id)
    });
  };

  const handleTestChange = (testId: string) => {
    // Save current work? Maybe prompt. For now, just switch.
    setActiveTestId(testId);
    // Reset passage selection to 1
    setActivePassageId('passage-1');
    // Load new data
    const test = book.tests.find(t => t.id === testId);
    const passage = test?.passages.find(p => p.id === 'passage-1') || { 
      id: 'passage-1', title: '', content: '', questions: [] 
    };
    setCurrentPassage(passage);
  };

  const handlePassageChange = (passageId: string) => {
    setActivePassageId(passageId);
    const test = book.tests.find(t => t.id === activeTestId);
    const passage = test?.passages.find(p => p.id === passageId) || { 
      id: passageId, title: '', content: '', questions: [] 
    };
    setCurrentPassage(passage);
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col overflow-hidden">
      <header className="bg-zinc-900 text-white px-6 py-4 flex items-center justify-between shadow-md">
        <div>
          <h1 className="text-xl font-bold">Edit Content: {book.title}</h1>
          <div className="text-xs text-zinc-400">Add passages and questions</div>
        </div>
        <div className="flex items-center space-x-4">
          <button onClick={onCancel} className="text-zinc-400 hover:text-white transition-colors">
            Cancel
          </button>
          <button 
            onClick={handleSavePassage}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-bold flex items-center space-x-2 transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save Passage</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar: Navigation */}
        <div className="w-64 bg-zinc-50 border-r border-zinc-200 p-4 overflow-y-auto">
          <h3 className="font-bold text-zinc-500 text-xs uppercase tracking-wider mb-4">Select Section</h3>
          
          {['1', '2', '3', '4'].map(num => (
            <div key={num} className="mb-6">
              <button
                onClick={() => handleTestChange(`test-${num}`)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium mb-2 transition-colors",
                  activeTestId === `test-${num}` ? "bg-zinc-200 text-zinc-900" : "text-zinc-500 hover:bg-zinc-100"
                )}
              >
                <span>Test {num}</span>
                {activeTestId === `test-${num}` && <ChevronRight className="w-4 h-4" />}
              </button>
              
              {activeTestId === `test-${num}` && (
                <div className="ml-4 space-y-1 border-l-2 border-zinc-200 pl-2">
                  {['1', '2', '3'].map(pNum => (
                    <button
                      key={pNum}
                      onClick={() => handlePassageChange(`passage-${pNum}`)}
                      className={cn(
                        "w-full text-left px-3 py-1.5 rounded-md text-xs transition-colors",
                        activePassageId === `passage-${pNum}` ? "bg-emerald-50 text-emerald-700 font-bold" : "text-zinc-500 hover:bg-zinc-100"
                      )}
                    >
                      Passage {pNum}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Main Editor Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Passage Editor */}
          <div className="w-1/2 p-6 overflow-y-auto border-r border-zinc-200">
            <div className="flex items-center space-x-2 mb-4 text-emerald-600 font-bold">
              <FileText className="w-5 h-5" />
              <h2>Passage Content</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Passage Title</label>
                <input
                  type="text"
                  value={currentPassage.title}
                  onChange={e => setCurrentPassage({ ...currentPassage, title: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="e.g., The History of Tea"
                />
              </div>
              
              <div className="flex-1">
                <label className="block text-sm font-medium text-zinc-700 mb-1">Passage Text</label>
                <textarea
                  value={currentPassage.content}
                  onChange={e => setCurrentPassage({ ...currentPassage, content: e.target.value })}
                  className="w-full h-[600px] px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-serif leading-relaxed resize-none"
                  placeholder="Paste the full passage text here..."
                />
              </div>
            </div>
          </div>

          {/* Questions Editor */}
          <div className="w-1/2 p-6 overflow-y-auto bg-zinc-50/50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2 text-blue-600 font-bold">
                <HelpCircle className="w-5 h-5" />
                <h2>Questions ({currentPassage.questions.length})</h2>
              </div>
              <button
                onClick={handleAddQuestion}
                className="flex items-center space-x-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Question</span>
              </button>
            </div>

            <div className="space-y-6">
              {currentPassage.questions.map((q, idx) => (
                <div key={q.id} className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm relative group">
                  <button 
                    onClick={() => deleteQuestion(q.id)}
                    className="absolute top-2 right-2 p-1.5 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-zinc-400 text-sm">Q{idx + 1}</span>
                      <select
                        value={q.type}
                        onChange={e => updateQuestion(q.id, 'type', e.target.value)}
                        className="text-xs border border-zinc-200 rounded px-2 py-1 bg-zinc-50"
                      >
                        <option value="text">Fill in Blank</option>
                        <option value="mcq">Multiple Choice</option>
                        <option value="boolean">True/False/NG</option>
                      </select>
                    </div>

                    <input
                      type="text"
                      value={q.text}
                      onChange={e => updateQuestion(q.id, 'text', e.target.value)}
                      className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:border-blue-500 outline-none"
                      placeholder="Question text..."
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-zinc-500 mb-1">Correct Answer</label>
                        <input
                          type="text"
                          value={q.correctAnswer}
                          onChange={e => updateQuestion(q.id, 'correctAnswer', e.target.value)}
                          className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:border-emerald-500 outline-none bg-emerald-50/30"
                          placeholder="Exact answer match"
                        />
                      </div>
                      
                      {q.type === 'mcq' && (
                        <div>
                          <label className="block text-xs font-medium text-zinc-500 mb-1">Options (comma separated)</label>
                          <input
                            type="text"
                            value={q.options?.join(',') || ''}
                            onChange={e => updateQuestion(q.id, 'options', e.target.value.split(','))}
                            className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:border-blue-500 outline-none"
                            placeholder="Option A,Option B,Option C"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {currentPassage.questions.length === 0 && (
                <div className="text-center py-10 text-zinc-400 border-2 border-dashed border-zinc-200 rounded-xl">
                  No questions added yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
