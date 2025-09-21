import { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link, useNavigate } from 'react-router-dom';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

export default function Login({ setIsAuthenticated }) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = e => {
  e.preventDefault();

  const savedPhone = localStorage.getItem("userPhone");
  const savedPassword = localStorage.getItem("userPassword");

  if (phone === savedPhone && password === savedPassword) {
    toast.success("Muvaffaqiyatli kirildi!");
    localStorage.setItem("token", "true");
    setIsAuthenticated(true);
    setTimeout(() => navigate("/dictionaries"), 100);
  } else {
    toast.error("Telefon yoki parol noto‘g‘ri!");
  }
};

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="w-full max-w-sm bg-white shadow-lg rounded-2xl p-6 space-y-6">
          <h2 className="text-2xl font-bold text-center">Kirish</h2>

          <form onSubmit={handleLogin} className="space-y-4">
            <PhoneInput
              country={'uz'}
              value={phone}
              onChange={setPhone}
              enableSearch={true}
              inputStyle={{
                width: '100%',
                borderRadius: '0.5rem',
                padding: '0.75rem',
                paddingLeft: '3.5rem',
              }}
            />

            <input
              type="password"
              placeholder="Parol"
              className="w-full px-3 py-2 border rounded-lg"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />

            <button
              type="submit"
              className="w-full bg-black text-white py-2 rounded-lg"
            >
              Kirish
            </button>
          </form>

          <p className="text-center text-sm">
            Akkountingiz yo‘qmi?{' '}
            <Link to="/register" className="text-blue-600 underline">
              Ro‘yxatdan o‘ting
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
