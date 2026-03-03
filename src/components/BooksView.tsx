import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, BookOpen, Upload, Trash2, ExternalLink, FileText, Plus, Edit, Play, ChevronRight } from 'lucide-react';
import { cn } from '../utils';
import { ReadingBook, ReadingTest } from '../types';
import { ReadingTestRunner } from './reading/ReadingTestRunner';
import { ReadingTestEditor } from './reading/ReadingTestEditor';

interface BooksViewProps {
  onBack: () => void;
}

export const BooksView: React.FC<BooksViewProps> = ({ onBack }) => {
  const [books, setBooks] = useState<ReadingBook[]>([]);
  const [viewMode, setViewMode] = useState<'library' | 'details' | 'runner' | 'editor'>('library');
  const [selectedBook, setSelectedBook] = useState<ReadingBook | null>(null);
  const [selectedTest, setSelectedTest] = useState<ReadingTest | null>(null);

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  
  // Form State
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newPdfUrl, setNewPdfUrl] = useState('');
  const [newCoverUrl, setNewCoverUrl] = useState('');

  useEffect(() => {
    const savedBooks = localStorage.getItem('express_yourself_books');
    if (savedBooks) {
      const parsed = JSON.parse(savedBooks);
      // Migration: Ensure 'tests' array exists
      const migrated = parsed.map((b: any) => ({
        ...b,
        tests: b.tests || []
      }));
      setBooks(migrated);
    } else {
      // Add some default Cambridge books if empty
      const defaultBooks: ReadingBook[] = [
        {
          id: 'cam-18',
          title: 'Cambridge IELTS 18 Academic',
          author: 'Cambridge University Press',
          pdfUrl: 'https://www.cambridge.org/us/cambridgeenglish/catalog/cambridge-english-exams-ielts/ielts-18',
          dateAdded: new Date().toISOString(),
          coverUrl: 'https://www.cambridge.org/us/cambridgeenglish/images/product/9781009338586_p_cover.jpg',
          tests: []
        },
        {
          id: 'cam-17',
          title: 'Cambridge IELTS 17 Academic',
          author: 'Cambridge University Press',
          pdfUrl: 'https://www.cambridge.org/us/cambridgeenglish/catalog/cambridge-english-exams-ielts/ielts-17',
          dateAdded: new Date().toISOString(),
          coverUrl: 'https://www.cambridge.org/us/cambridgeenglish/images/product/9781108933858_p_cover.jpg',
          tests: []
        }
      ];
      setBooks(defaultBooks);
      localStorage.setItem('express_yourself_books', JSON.stringify(defaultBooks));
    }
  }, []);

  const saveBooks = (updatedBooks: ReadingBook[]) => {
    setBooks(updatedBooks);
    localStorage.setItem('express_yourself_books', JSON.stringify(updatedBooks));
  };

  const handleAddBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    const newBook: ReadingBook = {
      id: Date.now().toString(),
      title: newTitle,
      author: newAuthor || 'Unknown',
      pdfUrl: newPdfUrl,
      coverUrl: newCoverUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(newTitle)}&background=10b981&color=fff&size=256`,
      dateAdded: new Date().toISOString(),
      tests: []
    };

    saveBooks([newBook, ...books]);
    
    // Reset form
    setNewTitle('');
    setNewAuthor('');
    setNewPdfUrl('');
    setNewCoverUrl('');
    setIsUploadOpen(false);
  };

  const handleDeleteBook = (id: string) => {
    if (confirm('Are you sure you want to delete this book?')) {
      saveBooks(books.filter(b => b.id !== id));
      if (selectedBook?.id === id) {
        setViewMode('library');
        setSelectedBook(null);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'pdf' | 'cover') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File is too large for browser storage. Please use a URL instead or a smaller file.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'pdf') setNewPdfUrl(reader.result as string);
      else setNewCoverUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleBookClick = (book: ReadingBook) => {
    setSelectedBook(book);
    setViewMode('details');
  };

  const handleUpdateBookContent = (updatedBook: ReadingBook) => {
    const updatedBooks = books.map(b => b.id === updatedBook.id ? updatedBook : b);
    saveBooks(updatedBooks);
    setSelectedBook(updatedBook);
    // Stay in editor or go back? Let's stay in editor but show success, 
    // or maybe the editor handles its own save notification.
  };

  const startTest = (test: ReadingTest) => {
    setSelectedTest(test);
    setViewMode('runner');
  };

  // --- Render Sub-Views ---

  if (viewMode === 'runner' && selectedTest) {
    return (
      <ReadingTestRunner 
        test={selectedTest} 
        onComplete={(score, total) => {
          alert(`Test Complete! Score: ${score}/${total}`);
          setViewMode('details');
        }}
        onExit={() => setViewMode('details')}
      />
    );
  }

  if (viewMode === 'editor' && selectedBook) {
    return (
      <ReadingTestEditor 
        book={selectedBook}
        onSave={handleUpdateBookContent}
        onCancel={() => setViewMode('details')}
      />
    );
  }

  if (viewMode === 'details' && selectedBook) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="max-w-5xl mx-auto px-6 py-12 space-y-8"
      >
        <div className="flex items-center space-x-4 mb-8">
          <button 
            onClick={() => setViewMode('library')}
            className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-zinc-600" />
          </button>
          <h1 className="text-3xl font-bold text-zinc-900">{selectedBook.title}</h1>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Book Info Sidebar */}
          <div className="w-full md:w-1/3 space-y-6">
            <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-lg bg-zinc-100">
              {selectedBook.coverUrl ? (
                <img src={selectedBook.coverUrl} alt={selectedBook.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-emerald-50 text-emerald-200">
                  <BookOpen className="w-20 h-20" />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <h2 className="font-bold text-xl">{selectedBook.title}</h2>
              <p className="text-zinc-500">{selectedBook.author}</p>
              <p className="text-xs text-zinc-400">Added: {new Date(selectedBook.dateAdded).toLocaleDateString()}</p>
            </div>
            
            <div className="space-y-3">
              {selectedBook.pdfUrl && (
                <a 
                  href={selectedBook.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center space-x-2 w-full py-3 bg-zinc-100 text-zinc-700 font-bold rounded-xl hover:bg-zinc-200 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open PDF</span>
                </a>
              )}
              <button
                onClick={() => setViewMode('editor')}
                className="flex items-center justify-center space-x-2 w-full py-3 bg-zinc-900 text-white font-bold rounded-xl hover:bg-zinc-800 transition-colors"
              >
                <Edit className="w-4 h-4" />
                <span>Manage Content</span>
              </button>
            </div>
          </div>

          {/* Tests Grid */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <FileText className="w-6 h-6 mr-2 text-emerald-600" />
              Available Tests
            </h2>
            
            <div className="grid grid-cols-1 gap-4">
              {['1', '2', '3', '4'].map((testNum) => {
                const testId = `test-${testNum}`;
                const test = selectedBook.tests.find(t => t.id === testId);
                const hasContent = test && test.passages.length > 0;

                return (
                  <div 
                    key={testId}
                    className={cn(
                      "p-6 rounded-2xl border transition-all flex items-center justify-between group",
                      hasContent 
                        ? "bg-white border-zinc-200 hover:border-emerald-500 hover:shadow-md cursor-pointer" 
                        : "bg-zinc-50 border-zinc-100 opacity-70"
                    )}
                    onClick={() => hasContent && startTest(test!)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg",
                        hasContent ? "bg-emerald-100 text-emerald-600" : "bg-zinc-200 text-zinc-400"
                      )}>
                        {testNum}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">Reading Test {testNum}</h3>
                        <p className="text-sm text-zinc-500">
                          {hasContent 
                            ? `${test?.passages.length} Passages • 60 Minutes` 
                            : "No content available"}
                        </p>
                      </div>
                    </div>
                    
                    {hasContent ? (
                      <button className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-all">
                        <Play className="w-5 h-5 fill-current" />
                      </button>
                    ) : (
                      <div className="text-xs font-medium text-zinc-400 px-3 py-1 bg-zinc-100 rounded-lg">
                        Empty
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // --- Default Library View ---

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-6xl mx-auto px-6 py-12 space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-zinc-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-zinc-900">Cambridge IELTS Library</h1>
            <p className="text-zinc-500">Access study materials and practice books</p>
          </div>
        </div>
        <button
          onClick={() => setIsUploadOpen(true)}
          className="flex items-center space-x-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl hover:bg-emerald-700 transition-all shadow-sm hover:shadow-md"
        >
          <Plus className="w-5 h-5" />
          <span>Add Book</span>
        </button>
      </div>

      {/* Upload Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
          >
            <h2 className="text-xl font-bold mb-4">Add New Book</h2>
            <form onSubmit={handleAddBook} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Book Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="e.g. Cambridge IELTS 19"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Author / Publisher</label>
                <input
                  type="text"
                  value={newAuthor}
                  onChange={e => setNewAuthor(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="e.g. Cambridge University Press"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Cover Image</label>
                  <div className="relative border-2 border-dashed border-zinc-300 rounded-lg p-4 text-center hover:bg-zinc-50 transition-colors cursor-pointer">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => handleFileUpload(e, 'cover')}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <div className="text-xs text-zinc-500">
                      {newCoverUrl ? 'Image Selected' : 'Click to Upload'}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">PDF File (Optional)</label>
                  <div className="relative border-2 border-dashed border-zinc-300 rounded-lg p-4 text-center hover:bg-zinc-50 transition-colors cursor-pointer">
                    <input 
                      type="file" 
                      accept="application/pdf" 
                      onChange={(e) => handleFileUpload(e, 'pdf')}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <div className="text-xs text-zinc-500">
                      {newPdfUrl ? 'PDF Selected' : 'Click to Upload'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-xs text-zinc-400">
                Or paste a direct URL:
                <input 
                  type="url" 
                  value={newPdfUrl} 
                  onChange={e => setNewPdfUrl(e.target.value)}
                  placeholder="https://example.com/book.pdf"
                  className="w-full mt-1 px-2 py-1 border border-zinc-200 rounded text-xs"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2 text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Add to Library
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Books Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {books.map((book) => (
          <div 
            key={book.id}
            onClick={() => handleBookClick(book)}
            className="group bg-white border border-zinc-200 rounded-2xl overflow-hidden hover:shadow-xl hover:border-emerald-200 transition-all duration-300 flex flex-col cursor-pointer"
          >
            {/* Cover */}
            <div className="relative aspect-[3/4] bg-zinc-100 overflow-hidden">
              {book.coverUrl ? (
                <img 
                  src={book.coverUrl} 
                  alt={book.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-emerald-50 text-emerald-200">
                  <BookOpen className="w-16 h-16" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              
              {/* Actions Overlay */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                 <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteBook(book.id);
                  }}
                  className="p-2 bg-white/90 text-red-500 rounded-full hover:bg-red-50 transition-colors shadow-sm"
                  title="Delete Book"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Info */}
            <div className="p-4 flex-1 flex flex-col">
              <h3 className="font-bold text-zinc-900 line-clamp-2 mb-1 group-hover:text-emerald-700 transition-colors">
                {book.title}
              </h3>
              <p className="text-sm text-zinc-500 mb-4">{book.author}</p>
              
              <div className="mt-auto pt-4 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-400">
                <span>{book.tests?.length || 0} Tests</span>
                <span className="flex items-center text-emerald-600 font-bold">
                  Open <ChevronRight className="w-3 h-3 ml-1" />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {books.length === 0 && (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-10 h-10 text-zinc-300" />
          </div>
          <h3 className="text-xl font-bold text-zinc-900">No books yet</h3>
          <p className="text-zinc-500 mt-2">Upload your Cambridge IELTS books to get started.</p>
        </div>
      )}
    </motion.div>
  );
};
