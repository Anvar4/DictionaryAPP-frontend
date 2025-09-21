import { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Button } from '@/components/ui/button';
import { FiRefreshCw, FiMoreVertical, FiEdit2, FiTrash2 } from 'react-icons/fi';
import Sidebar from '@/components/Sidebar';
import API from '@/utils/api';

// Qo'shildi: Birinchi harfni katta qiluvchi funksiya
function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function Words() {
  const [words, setWords] = useState([]);
  const [dictionaries, setDictionaries] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [activeSection, setActiveSection] = useState("so'zlar");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 10;
  const [openMenuId, setOpenMenuId] = useState(null);
  const [sortType, setSortType] = useState('createdAt');
  const handleSortChange = e => {
    setSortType(e.target.value);
  };

  // Word form states
  const [wordName, setWordName] = useState('');
  const [wordDesc, setWordDesc] = useState('');
  const [wordDict, setWordDict] = useState('');
  const [wordDept, setWordDept] = useState('');
  const [wordCat, setWordCat] = useState('');
  const [wordImage, setWordImage] = useState('');
  const [wordImageFile, setWordImageFile] = useState(null);
  const [wordImageUploading, setWordImageUploading] = useState(false);
  const [editWordId, setEditWordId] = useState(null);

  // For delete modal
  const [deleteWordId, setDeleteWordId] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      await Promise.all([
        getWords(),
        getDictionaries(),
        getDepartments(),
        getCategories(),
      ]);
      setLoading(false);
    };
    fetchAll();
  }, []);

  const getWords = async () => {
    try {
      const res = await API.get('/words');
      setWords(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error("So'zlarni olishda xatolik");
    }
  };

  const getDictionaries = async () => {
    try {
      const res = await API.get('/dictionaries');
      setDictionaries(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error("Lug'atlarni olishda xatolik");
    }
  };

  const getDepartments = async () => {
    try {
      const res = await API.get('/departments');
      setDepartments(
        Array.isArray(res.data) ? res.data : res.data.departments || []
      );
    } catch {
      toast.error("Bo'limlarni olishda xatolik");
    }
  };

  const getCategories = async () => {
    try {
      const res = await API.get('/categories');
      setCategories(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error('Kategoriyalarni olishda xatolik');
    }
  };

  // Search
  const handleSearch = e => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      setSearchResults(null);
      return;
    }
    const results = words.filter(item =>
      item.name.toLowerCase().includes(searchTerm.trim().toLowerCase())
    );
    setSearchResults(results);
  };

  // Add Word
  const handleAddWord = async e => {
    e.preventDefault();
    if (!wordName.trim()) {
      toast.error("So'z nomi kiritilishi shart!");
      return;
    }
    if (!wordDesc.trim()) {
      toast.error('Tavsif kiritilishi shart!');
      return;
    }
    if (!wordDict || !wordDept || !wordCat) {
      toast.error("Lug'at, bo'lim va kategoriya tanlanishi shart!");
      return;
    }
    setAddLoading(true);
    try {
      if (wordImageFile) {
        setWordImageUploading(true);
        const formData = new FormData();
        formData.append('image', wordImageFile);
        // Qo'shildi: name birinchi harfi katta bo'ladi
        formData.append('name', capitalize(wordName));
        formData.append('meaning', wordDesc);
        formData.append('dictionary', wordDict);
        formData.append('department', wordDept);
        formData.append('category', wordCat);
        formData.append('dictType', getDictObj(wordDict)?.type || '');
        const res = await API.post('/words', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setWords(prev => [res.data, ...prev]);
        setWordImageUploading(false);
      } else {
        const payload = {
          name: capitalize(wordName), // Qo'shildi
          meaning: wordDesc,
          dictionary: wordDict,
          department: wordDept,
          category: wordCat,
          dictType: getDictObj(wordDict)?.type || '',
        };
        console.log('Payload:', payload);
        const res = await API.post('/words', payload);
        setWords(prev => [res.data, ...prev]);
      }
      toast.success("So'z qo'shildi!");
      setShowAddModal(false);
      setWordName('');
      setWordDesc('');
      setWordDict('');
      setWordDept('');
      setWordCat('');
      setWordImage('');
      setWordImageFile(null);
    } catch (err) {
      console.log('Backend error:', err.response?.data);
      toast.error(err.response?.data?.error || "So'z qo'shishda xatolik!");
      setWordImageUploading(false);
    } finally {
      setAddLoading(false);
    }
  };

  // Edit Word
  const openEditModal = word => {
    setEditWordId(word._id);
    setWordName(word.name);
    setWordDesc(word.meaning || '');
    setWordDict(word.dictionary?._id || word.dictionary?.id || word.dictionary);
    setWordDept(word.department?._id || word.department?.id || word.department);
    setWordCat(word.category?._id || word.category?.id || word.category);
    setWordImage(word.imageUrl || '');
    setWordImageFile(null);
    setShowEditModal(true);
  };

  const handleEditWord = async e => {
    e.preventDefault();
    if (!wordName.trim()) {
      toast.error("So'z nomi kiritilishi shart!");
      return;
    }
    if (!wordDict || !wordDept || !wordCat) {
      toast.error("Lug'at, bo'lim va kategoriya tanlanishi shart!");
      return;
    }
    setEditLoading(true);
    try {
      let res;
      if (wordImageFile) {
        setWordImageUploading(true);
        const formData = new FormData();
        formData.append('image', wordImageFile);
        // Qo'shildi: name birinchi harfi katta bo'ladi
        formData.append('name', capitalize(wordName));
        formData.append('meaning', wordDesc);
        formData.append('dictionary', wordDict);
        formData.append('department', wordDept);
        formData.append('category', wordCat);
        formData.append('dictType', getDictObj(wordDict)?.type || '');
        res = await API.put(`/words/${editWordId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setWordImageUploading(false);
      } else {
        const payload = {
          name: capitalize(wordName), // Qo'shildi
          meaning: wordDesc,
          dictionary: wordDict,
          department: wordDept,
          category: wordCat,
          dictType: getDictObj(wordDict)?.type || '',
        };
        res = await API.put(`/words/${editWordId}`, payload);
      }
      setWords(prev => prev.map(w => (w._id === editWordId ? res.data : w)));
      toast.success("So'z tahrirlandi!");
      setShowEditModal(false);
      setEditWordId(null);
      setWordName('');
      setWordDesc('');
      setWordDict('');
      setWordDept('');
      setWordCat('');
      setWordImage('');
      setWordImageFile(null);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Tahrirlashda xatolik!');
      setWordImageUploading(false);
    } finally {
      setEditLoading(false);
    }
  };

  // Delete Word
  const openDeleteModal = wordId => {
    setDeleteWordId(wordId);
    setShowDeleteModal(true);
  };

  const handleDeleteWord = async () => {
    setDeleteLoading(true);
    try {
      await API.delete(`/words/${deleteWordId}`);
      setWords(prev => prev.filter(w => w._id !== deleteWordId));
      toast.success("So'z o'chirildi!");
      setShowDeleteModal(false);
      setDeleteWordId(null);
    } catch (err) {
      toast.error(err.response?.data?.error || "O'chirishda xatolik!");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Helper: get dictionary, department, category info
  const getDictObj = id =>
    dictionaries.find(d => (d._id || d.id) === (id?._id || id?.id || id)) || {};
  const getDeptObj = id =>
    departments.find(d => (d._id || d.id) === (id?._id || id?.id || id)) || {};
  const getCatObj = id =>
    categories.find(c => (c._id || c.id) === (id?._id || id?.id || id)) || {};

  // Filtered and paginated words
  const filteredWordsRaw = searchResults !== null ? searchResults : words;
  let filteredWords = Array.isArray(filteredWordsRaw)
    ? [...filteredWordsRaw]
    : [];
  // Sort words based on sortType
  if (sortType === 'name') {
    filteredWords.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortType === 'createdAt') {
    filteredWords.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
  const totalPages = Math.ceil(filteredWords.length / itemsPerPage);
  const paginatedWords = filteredWords.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <>
      <ToastContainer position="top-center" autoClose={2000} />
      <div className="flex h-screen">
        <Sidebar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          handleLogout={() => {
            localStorage.removeItem('token');
            window.location.href = '/login';
          }}
        />
        <main className="flex-1 p-6 bg-white flex flex-col">
          <div className="flex justify-between items-center mb-4 w-full max-w-5xl mx-auto">
            <div className="flex items-center gap-4 w-full max-w-xl ">
              <h1 className="text-2xl font-bold flex items-center">So'zlar</h1>
              <select
                className="border rounded px-2 py-1 text-sm"
                value={sortType}
                onChange={handleSortChange}
                style={{ minWidth: 160 }}
              >
                <option value="createdAt">Vaqt bo'yicha tartiblash</option>
                <option value="name">Alifbo bo'yicha tartiblash</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <form onSubmit={handleSearch} className="flex items-center gap-1">
                <input
                  type="text"
                  placeholder="So'z nomini qidiring..."
                  className="border rounded px-2 py-1 text-sm"
                  value={searchTerm}
                  onChange={e => {
                    setSearchTerm(e.target.value);
                    if (!e.target.value) setSearchResults(null);
                  }}
                  style={{ minWidth: 180 }}
                />
                <Button type="submit" size="sm">
                  Qidirish
                </Button>
              </form>
              <Button onClick={() => setShowAddModal(true)}>
                + Yangi so'z qo‘shish
              </Button>
              <Button
                variant="ghost"
                size="icon"
                title="Yangilash"
                onClick={() => window.location.reload()}
              >
                <FiRefreshCw className="text-xl" />
              </Button>
            </div>
          </div>
          <div className="border rounded-lg w-full max-w-5xl mx-auto overflow-visible">
            <table className="w-full border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 w-1.5 border text-center align-middle">
                    T/R
                  </th>
                  <th className="p-3 border text-center align-middle">
                    So'z nomi
                  </th>
                  <th className="p-3 border text-center align-middle">
                    Kategoriya
                  </th>
                  <th className="p-3 border text-center align-middle">
                    Bo'lim
                  </th>
                  <th className="p-3 border text-center align-middle">
                    Tegishli lug'at nomi
                  </th>
                  <th className="p-3 border text-center align-middle">Rasm</th>
                  <th className="p-3 border text-center align-middle">Yana</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="10" className="p-3 text-center">
                      <span className="flex justify-center items-center gap-2">
                        <svg
                          className="animate-spin h-6 w-6 text-blue-500"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                          ></path>
                        </svg>
                        Yuklanmoqda...
                      </span>
                    </td>
                  </tr>
                ) : (
                  paginatedWords.map((item, idx) => {
                    const dict = getDictObj(item.dictionary);
                    const dept = getDeptObj(item.department);
                    const cat = getCatObj(item.category);
                    return (
                      <tr
                        key={item._id || idx}
                        className="hover:bg-gray-50 relative"
                      >
                        <td className="p-3 border text-center align-middle">
                          {(currentPage - 1) * itemsPerPage + idx + 1}
                        </td>
                        <td className="p-3 border text-center align-middle font-bold">
                          {capitalize(item.name)}
                        </td>
                        <td className="p-3 border text-center align-middle">
                          {cat?.name ? (
                            <>{capitalize(cat.name)}</>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="p-3 border text-center align-middle">
                          {dept?.name ? (
                            <>{capitalize(dept.name)}</>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="p-3 border text-center align-middle">
                          {dict?.name ? (
                            <>
                              {capitalize(dict.name)}
                              {dict.type && (
                                <span className="italic text-xs ml-1">
                                  ({dict.type})
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="p-3 border text-center align-middle">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-12 h-12 object-cover rounded mx-auto cursor-pointer border"
                              style={{ display: 'inline-block' }}
                            />
                          ) : (
                            <span className="text-gray-400">
                              Rasm mavjud emas
                            </span>
                          )}
                        </td>
                        <td className="p-3 border text-center align-middle relative">
                          <button
                            className="p-2 rounded hover:bg-gray-200"
                            onClick={() =>
                              setOpenMenuId(
                                openMenuId === item._id ? null : item._id
                              )
                            }
                          >
                            <FiMoreVertical />
                          </button>
                          {openMenuId === item._id && (
                            <div className="absolute right-0 z-10 bg-white border rounded shadow-md mt-2 w-32">
                              <button
                                className="flex items-center gap-2 px-4 py-2 w-full hover:bg-gray-100"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  openEditModal(item);
                                }}
                              >
                                <FiEdit2 /> Tahrirlash
                              </button>
                              <button
                                className="flex items-center gap-2 px-4 py-2 w-full hover:bg-gray-100 text-red-500"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  openDeleteModal(item._id);
                                }}
                              >
                                <FiTrash2 /> O'chirish
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>
      {/* Pagination controls at the bottom center */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8 mb-4">
          <div className="flex gap-2 items-center">
            <Button
              size="sm"
              variant="ghost"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
            >
              &lt;
            </Button>
            <span className="text-sm">
              {currentPage} / {totalPages}
            </span>
            <Button
              size="sm"
              variant="ghost"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
            >
              &gt;
            </Button>
          </div>
        </div>
      )}

      {/* Qo'shish Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative">
            <button
              className="absolute top-2 right-3 text-2xl text-gray-400 hover:text-black"
              onClick={() => setShowAddModal(false)}
              disabled={addLoading}
            >
              ×
            </button>
            <h2 className="text-xl font-bold mb-4 text-center">
              Lug'atga yangi so'z qo'shish
            </h2>
            <form onSubmit={handleAddWord} className="space-y-4">
              <div>
                <label className="block mb-1 font-medium">Nomi</label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2"
                  value={wordName}
                  onChange={e => setWordName(e.target.value)}
                  autoFocus
                  disabled={addLoading}
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Tavsif</label>
                <textarea
                  className="w-full border rounded px-3 py-2"
                  value={wordDesc}
                  onChange={e => setWordDesc(e.target.value)}
                  disabled={addLoading}
                  placeholder="Batafsil yozing..."
                  rows={2}
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Kategoriya</label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={wordCat}
                  onChange={e => {
                    const catId = e.target.value;
                    setWordCat(catId);
                    // Kategoriya obyektini topamiz
                    const catObj = categories.find(
                      c => (c._id || c.id) === catId
                    );
                    if (catObj) {
                      setWordDept(
                        catObj.department?._id ||
                          catObj.department?.id ||
                          catObj.department
                      );
                      setWordDict(
                        catObj.dictionary?._id ||
                          catObj.dictionary?.id ||
                          catObj.dictionary
                      );
                    } else {
                      setWordDept('');
                      setWordDict('');
                    }
                  }}
                  disabled={addLoading || categories.length === 0}
                >
                  <option value="">Tanlang</option>
                  {categories.map(cat => {
                    const dept = getDeptObj(cat.department);
                    const dict = getDictObj(cat.dictionary);
                    return (
                      <option key={cat._id || cat.id} value={cat._id || cat.id}>
                        {capitalize(cat.name)}
                        {dept?.name ? ` - ${capitalize(dept.name)}` : ''}
                        {dict?.name ? ` - ${capitalize(dict.name)}` : ''}
                        {dict?.type ? ` (${dict.type})` : ''}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div>
                <label className="block mb-1 font-medium">Rasm</label>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full border rounded px-3 py-2"
                  onChange={e => {
                    if (e.target.files && e.target.files[0]) {
                      setWordImageFile(e.target.files[0]);
                      setWordImage('');
                    }
                  }}
                  disabled={addLoading || wordImageUploading}
                />
                {wordImageUploading && (
                  <div className="flex items-center gap-2 text-blue-500 text-sm mt-1">
                    <svg
                      className="animate-spin h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      ></path>
                    </svg>
                    Rasm yuklanmoqda...
                  </div>
                )}
                {wordImage && (
                  <div className="flex justify-center mt-2">
                    <img
                      src={wordImage}
                      alt="Yuklangan rasm"
                      className="w-16 h-16 object-cover rounded border"
                    />
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  className="flex-1"
                  onClick={() => setShowAddModal(false)}
                  disabled={addLoading}
                >
                  Bekor qilish
                </Button>
                <Button type="submit" className="flex-1" disabled={addLoading}>
                  {addLoading ? 'Saqlanmoqda...' : 'Saqlash'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tahrirlash Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative">
            <button
              className="absolute top-2 right-3 text-2xl text-gray-400 hover:text-black"
              onClick={() => setShowEditModal(false)}
              disabled={editLoading}
            >
              ×
            </button>
            <h2 className="text-xl font-bold mb-4 text-center">
              So'zni tahrirlash
            </h2>
            <form onSubmit={handleEditWord} className="space-y-4">
              <div>
                <label className="block mb-1 font-medium">Nomi</label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2"
                  value={wordName}
                  onChange={e => setWordName(e.target.value)}
                  autoFocus
                  disabled={editLoading}
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Tavsif</label>
                <textarea
                  className="w-full border rounded px-3 py-2"
                  value={wordDesc}
                  onChange={e => setWordDesc(e.target.value)}
                  disabled={editLoading}
                  placeholder="Batafsil yozing..."
                  rows={2}
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Kategoriya</label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={wordCat}
                  onChange={e => setWordCat(e.target.value)}
                  disabled={editLoading || categories.length === 0}
                >
                  <option value="">Tanlang</option>
                  {categories.map(cat => {
                    const dept = getDeptObj(cat.department);
                    const dict = getDictObj(cat.dictionary);
                    return (
                      <option key={cat._id || cat.id} value={cat._id || cat.id}>
                        {capitalize(cat.name)}
                        {dept?.name ? ` - ${capitalize(dept.name)}` : ''}
                        {dict?.name ? ` - ${capitalize(dict.name)}` : ''}
                        {dict?.type ? ` (${dict.type})` : ''}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div>
                <label className="block mb-1 font-medium">Rasm</label>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full border rounded px-3 py-2"
                  onChange={e => {
                    if (e.target.files && e.target.files[0]) {
                      setWordImageFile(e.target.files[0]);
                      setWordImage('');
                    }
                  }}
                  disabled={editLoading || wordImageUploading}
                />
                {wordImageUploading && (
                  <div className="flex items-center gap-2 text-blue-500 text-sm mt-1">
                    <svg
                      className="animate-spin h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      ></path>
                    </svg>
                    Rasm yuklanmoqda...
                  </div>
                )}
                {wordImage && (
                  <div className="flex justify-center mt-2">
                    <img
                      src={wordImage}
                      alt="Yuklangan rasm"
                      className="w-16 h-16 object-cover rounded border"
                    />
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  className="flex-1"
                  onClick={() => setShowEditModal(false)}
                  disabled={editLoading}
                >
                  Bekor qilish
                </Button>
                <Button type="submit" className="flex-1" disabled={editLoading}>
                  {editLoading ? 'Saqlanmoqda...' : 'Saqlash'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* O'chirish Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-xs relative">
            <button
              className="absolute top-2 right-3 text-2xl text-gray-400 hover:text-black"
              onClick={() => setShowDeleteModal(false)}
              disabled={deleteLoading}
            >
              ×
            </button>
            <h2 className="text-lg font-bold mb-4 text-center">
              So'zni o'chirish
            </h2>
            <p className="mb-6 text-center">
              Haqiqatan ham ushbu so‘zni o‘chirilsinmi?
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                className="flex-1"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleteLoading}
              >
                Bekor qilish
              </Button>
              <Button
                type="button"
                className="flex-1"
                variant="destructive"
                onClick={handleDeleteWord}
                disabled={deleteLoading}
              >
                {deleteLoading ? "O'chirilmoqda..." : "O'chirish"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Words;
