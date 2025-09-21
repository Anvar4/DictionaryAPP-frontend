import { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Button } from '@/components/ui/button';
import { FiRefreshCw } from 'react-icons/fi';
import Sidebar from '@/components/Sidebar';
import API from '@/utils/api';
import DictionaryActions from '@/components/DictionaryActions';

function Departments() {
  const [departments, setDepartments] = useState([]);
  const [dictionaries, setDictionaries] = useState([]);
  const [setActiveSection] = useState("bo'limlar");
  const [showAddModal, setShowAddModal] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptDict, setNewDeptDict] = useState('');
  const [newDeptImage, setNewDeptImage] = useState('');
  const [newDeptImageFile, setNewDeptImageFile] = useState(null);
  const [newDeptImageUploading, setNewDeptImageUploading] = useState(false);
  const [newDeptDesc, setNewDeptDesc] = useState('');
  const [loading, setLoading] = useState(true);
  const [dictFilter, setDictFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [catName, setCatName] = useState('');
  const [categoryDept, setCategoryDept] = useState(null);
  const [catAddLoading, setCatAddLoading] = useState(false);
  const [editDeptId, setEditDeptId] = useState(null);

  // Function to open the edit modal and set department data
  const openEditModal = item => {
    setShowAddModal(true);
    setEditDeptId(item.id || item._id);
    setNewDeptName(item.name || '');
    setNewDeptDict(
      item.dictionary?.id || item.dictionary?._id || item.dictionary || ''
    );
    setNewDeptImage(item.imageUrl || '');
    setNewDeptImageFile(null);
    setNewDeptDesc(item.description || '');
  };

  useEffect(() => {
    getDepartments();
    getDictionaries();
  }, []);

  const getDepartments = async () => {
    try {
      setLoading(true);
      const res = await API.get('/departments');
      setDepartments(res.data.departments);
    } catch (error) {
      toast.error(
        "Bo'limlarni olishda xatolik: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };
  function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  const getDictionaries = async () => {
    try {
      const res = await API.get('/dictionaries');
      setDictionaries(res.data);
      if (res.data.length > 0)
        setNewDeptDict(res.data[0].id || res.data[0]._id);
    } catch (error) {
      toast.error(
        "Lug'atlarni olishda xatolik: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  const handleSearch = e => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      setSearchResults(null);
      return;
    }
    const results = departments.filter(item =>
      item.name.toLowerCase().includes(searchTerm.trim().toLowerCase())
    );
    setSearchResults(results);
  };

  const handleSaveDepartment = async e => {
    e.preventDefault();
    if (!newDeptName.trim()) {
      toast.error("Bo'lim nomi kiritilishi shart!");
      return;
    }
    if (!newDeptDict) {
      toast.error("Lug'at tanlanishi shart!");
      return;
    }
    setAddLoading(true);
    let imageUrl = newDeptImage;
    try {
      if (newDeptImageFile) {
        setNewDeptImageUploading(true);
        const formData = new FormData();
        formData.append('file', newDeptImageFile);
        const uploadRes = await API.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        imageUrl = uploadRes.data.url;
        setNewDeptImage(imageUrl);
        setNewDeptImageUploading(false);
      }
      if (editDeptId) {
        // Edit mode
        const payload = {
          name: newDeptName,
          dictionaryId:
            typeof newDeptDict === 'object'
              ? newDeptDict.id || newDeptDict._id
              : newDeptDict,
          imageUrl: imageUrl || undefined,
          description: newDeptDesc || undefined,
        };
        const res = await API.put(`/departments/${editDeptId}`, payload);
        setDepartments(prev =>
          prev.map(d =>
            d.id === editDeptId || d._id === editDeptId
              ? res.data.department
              : d
          )
        );
        toast.success("Bo'lim yangilandi!");
      } else {
        // Add mode
        const payload = {
          name: capitalize(newDeptName),
          dictionaryId:
            typeof newDeptDict === 'object'
              ? newDeptDict.id || newDeptDict._id
              : newDeptDict,
          imageUrl: imageUrl || undefined,
          description: newDeptDesc || undefined,
        };
        const res = await API.post('/departments', payload);
        setDepartments(prev => [res.data.department, ...prev]);
        toast.success("Bo'lim qo'shildi!");
      }
      setShowAddModal(false);
      setEditDeptId(null);
      setNewDeptName('');
      setNewDeptDict(dictionaries[0]?.id || dictionaries[0]?._id || '');
      setNewDeptImage('');
      setNewDeptImageFile(null);
      setNewDeptDesc('');
    } catch (err) {
      toast.error(err.response?.data?.message || "Bo'limni saqlashda xatolik!");
      setNewDeptImageUploading(false);
    } finally {
      setAddLoading(false);
    }
  };

  // Filter by dictionary
  const filteredDepartmentsRaw =
    dictFilter === 'all'
      ? searchResults !== null
        ? searchResults
        : departments
      : (searchResults !== null ? searchResults : departments).filter(dep => {
          const dictId =
            dep.dictionary?.id || dep.dictionary?._id || dep.dictionary;
          return dictId === dictFilter;
        });
  // Always ensure array
  const filteredDepartments = Array.isArray(filteredDepartmentsRaw)
    ? filteredDepartmentsRaw
    : [];

  // Pagination
  const totalPages = Math.ceil(filteredDepartments.length / itemsPerPage);
  const paginatedDepartments = filteredDepartments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <>
      <ToastContainer position="top-center" autoClose={2000} />
      <div className="flex h-screen">
        <Sidebar
          activeSection="bolimlar"
          setActiveSection={setActiveSection}
          handleLogout={() => {
            localStorage.removeItem('token');
            window.location.href = '/login';
          }}
        />
        <main className="flex-1 p-6 bg-white flex flex-col">
          <div className="flex justify-between items-center mb-4 w-full max-w-4xl mx-auto">
            <div className="flex items-center gap-2">
              <label className="text-2xl font-bold">Bo'limlar</label>
              <select
                className="border rounded px-2 py-1 text-sm"
                value={dictFilter}
                onChange={e => {
                  setDictFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">Barchasi</option>
                {dictionaries.map(dict => (
                  <option key={dict.id || dict._id} value={dict.id || dict._id}>
                    {dict.name} {dict.type ? `(${dict.type})` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <form onSubmit={handleSearch} className="flex items-center gap-1">
                <input
                  type="text"
                  placeholder="Bo'lim nomini qidiring..."
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
              <Button className="h-8" onClick={() => setShowAddModal(true)}>
                + Yangi bo'lim qo‘shish
              </Button>
              <Button
                variant="ghost"
                size="icon"
                title="Yangilash"
                onClick={() => window.location.reload()}
              >
                <FiRefreshCw className="text-xl" />
              </Button>
              {totalPages > 1 && (
                <div className="flex gap-1 items-center ml-2">
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
              )}
            </div>
          </div>
          {showAddModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
              <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-sm relative">
                <button
                  className="absolute top-2 right-3 text-2xl text-gray-400 hover:text-black"
                  onClick={() => setShowAddModal(false)}
                  disabled={addLoading}
                >
                  ×
                </button>
                <h2 className="text-xl font-bold mb-4 text-center">
                  Yangi bo'lim qo'shish
                </h2>
                <form onSubmit={handleSaveDepartment} className="space-y-4">
                  <div>
                    <label className="block mb-1 font-medium">
                      Bo'lim nomi
                    </label>
                    <input
                      type="text"
                      className="w-full border rounded px-3 py-2"
                      value={newDeptName}
                      onChange={e => setNewDeptName(e.target.value)}
                      disabled={addLoading}
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">
                      Tegishli lug'at
                    </label>
                    <select
                      className="w-full border rounded px-3 py-2"
                      value={newDeptDict}
                      onChange={e => setNewDeptDict(e.target.value)}
                      disabled={addLoading || dictionaries.length === 0}
                    >
                      {dictionaries.map(dict => (
                        <option
                          key={dict.id || dict._id}
                          value={dict.id || dict._id}
                        >
                          {dict.name} {dict.type ? `(${dict.type})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">
                      Rasm (ixtiyoriy)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      className="w-full border rounded px-3 py-2"
                      onChange={e => {
                        if (e.target.files && e.target.files[0]) {
                          setNewDeptImageFile(e.target.files[0]);
                          setNewDeptImage('');
                        }
                      }}
                      disabled={addLoading || newDeptImageUploading}
                    />
                    {newDeptImageUploading && (
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
                    {newDeptImage && (
                      <div className="flex justify-center mt-2">
                        <img
                          src={newDeptImage}
                          alt="Yuklangan rasm"
                          className="w-16 h-16 object-cover rounded border"
                        />
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">
                      Tavsif (ixtiyoriy)
                    </label>
                    <textarea
                      className="w-full border rounded px-3 py-2"
                      value={newDeptDesc}
                      onChange={e => setNewDeptDesc(e.target.value)}
                      disabled={addLoading}
                      placeholder="Bo'lim haqida qisqacha..."
                      rows={2}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={addLoading}
                  >
                    {addLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg
                          className="animate-spin h-4 w-4"
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
                    ) : editDeptId ? (
                      'Saqlash'
                    ) : (
                      'Saqlash'
                    )}
                  </Button>
                </form>
              </div>
            </div>
          )}
          <div className="border rounded-lg w-full max-w-4xl mx-auto overflow-visible">
            <table className="w-full border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 w-1.5 border text-center align-middle">
                    T/R
                  </th>
                  <th className="p-3 border text-center align-middle">Nomi</th>
                  <th className="p-3 border text-center align-middle">
                    Tegishli lug'at nomi
                  </th>
                  <th className="p-3 border text-center align-middle">Rasm</th>
                  <th className="p-3 border text-center align-middle">
                    Tavsif
                  </th>
                  <th className="p-3 border text-center align-middle">
                    Kategoriya qo'shish
                  </th>
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
                  paginatedDepartments.map((item, index) => {
                    const dict = dictionaries.find(
                      d =>
                        (d.id || d._id) ===
                        (item.dictionary?.id ||
                          item.dictionary?._id ||
                          item.dictionary)
                    );
                    return (
                      <tr
                        key={item.id || item._id || index}
                        className="hover:bg-gray-50 relative"
                      >
                        <td className="p-3 border text-center align-middle">
                          {(currentPage - 1) * itemsPerPage + index + 1}
                        </td>
                        <td className="p-3 border text-center align-middle font-bold">
                          {item.name}
                        </td>
                        <td className="p-3 border text-center align-middle">
                          {dict ? (
                            `${dict.name} ${dict.type ? `(${dict.type})` : ''}`
                          ) : (
                            <span className="text-gray-400 ">-</span>
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
                            <span className="text-gray-400 italic">
                              Rasm mavjud emas
                            </span>
                          )}
                        </td>
                        <td className="p-3 border text-center align-middle">
                          {item.description || (
                            <span className="text-gray-400 italic">
                              Tavsif yo‘q
                            </span>
                          )}
                        </td>
                        <td className="p-3 border text-center align-middle">
                          <Button
                            size="sm"
                            onClick={() => {
                              setShowCategoryModal(true);
                              setCategoryDept(item);
                              setCatName('');
                            }}
                          >
                            + Kategoriya qo'shish
                          </Button>
                        </td>
                        <td className="p-3 border text-center align-middle">
                          <DictionaryActions
                            item={item}
                            onEdit={() => openEditModal(item)}
                            onDelete={async dep => {
                              try {
                                await API.delete(
                                  `/departments/${dep.id || dep._id}`
                                );
                                setDepartments(prev =>
                                  prev.filter(
                                    d =>
                                      d.id !== (dep.id || dep._id) &&
                                      d._id !== (dep.id || dep._id)
                                  )
                                );
                                toast.success("Bo'lim o‘chirildi!");
                              } catch (err) {
                                toast.error(
                                  err.response?.data?.message ||
                                    'O‘chirishda xatolik!'
                                );
                              }
                            }}
                          />
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
      {showCategoryModal && categoryDept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-sm relative">
            <button
              className="absolute top-2 right-3 text-2xl text-gray-400 hover:text-black"
              onClick={() => setShowCategoryModal(false)}
              disabled={catAddLoading}
            >
              ×
            </button>
            <h2 className="text-xl font-bold mb-4 text-center">
              Yangi kategoriya qo'shish
            </h2>
            <form
              onSubmit={async e => {
                e.preventDefault();
                if (!catName.trim()) {
                  toast.error('Kategoriya nomi kiritilishi shart!');
                  return;
                }
                try {
                  setCatAddLoading(true);
                  const payload = {
                    name: catName,
                    department: categoryDept.id || categoryDept._id,
                    dictionary:
                      categoryDept.dictionary?.id ||
                      categoryDept.dictionary?._id ||
                      categoryDept.dictionary,
                  };
                  await API.post('/categories', payload);
                  toast.success("Kategoriya qo'shildi!");
                  setShowCategoryModal(false);
                  setCatName('');
                  setCategoryDept(null);
                } catch (err) {
                  toast.error(
                    err.response?.data?.message ||
                      "Kategoriya qo'shishda xatolik!"
                  );
                } finally {
                  setCatAddLoading(false);
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block mb-1 font-medium">
                  Kategoriya nomi
                </label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2"
                  value={catName}
                  onChange={e => setCatName(e.target.value)}
                  autoFocus
                  disabled={catAddLoading}
                />
              </div>
              <div className="bg-gray-50 rounded p-2 text-sm mb-2">
                <div>
                  <span className="font-medium">Bo'lim:</span>{' '}
                  {categoryDept.name}
                </div>
                <div>
                  <span className="font-medium">Lug'at:</span>{' '}
                  {(() => {
                    const dict = dictionaries.find(
                      d =>
                        (d.id || d._id) ===
                        (categoryDept.dictionary?.id ||
                          categoryDept.dictionary?._id ||
                          categoryDept.dictionary)
                    );
                    return dict
                      ? `${dict.name} ${dict.type ? `(${dict.type})` : ''}`
                      : '-';
                  })()}
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={catAddLoading}>
                {catAddLoading ? 'Saqlanmoqda...' : 'Saqlash'}
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default Departments;
