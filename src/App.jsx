import Dictionary from '@/pages/Dictionary';
import Departments from '@/pages/Departments';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Category from '@/pages/category';
import Words from '@/pages/words';
import { useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem('token')
  );

  return (
    <Routes>
      <Route
        path="/"
        element={<Login setIsAuthenticated={setIsAuthenticated} />}
      />
      <Route
        path="/login"
        element={<Login setIsAuthenticated={setIsAuthenticated} />}
      />
      <Route
        path="/register"
        element={<Register setIsAuthenticated={setIsAuthenticated} />}
      />
      <Route
        path="/dictionaries"
        element={
          isAuthenticated ? <Dictionary /> : <Navigate to="/login" replace />
        }
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
      <Route
        path="/departments"
        element={
          isAuthenticated ? <Departments /> : <Navigate to="/login" replace />
        }
      />
      <Route
        path="/categories"
        element={
          isAuthenticated ? <Category /> : <Navigate to="/login" replace />
        }
      />
      <Route
        path="/words"
        element={isAuthenticated ? <Words /> : <Navigate to="/login" replace />}
      />
    </Routes>
  );
}

export default App;
