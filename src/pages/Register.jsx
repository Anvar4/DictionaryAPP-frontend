import { useState, useRef, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link, useNavigate } from "react-router-dom";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

export default function Register({ setIsAuthenticated }) {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const captchaCanvas = useRef(null);
  const navigate = useNavigate();

  // Captcha yaratish
  const generateCaptcha = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptcha(code);

    // Canvasga chizish
    const canvas = captchaCanvas.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Orqa fon
    ctx.fillStyle = "#f2f2f2";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Harflarni chizish
    for (let i = 0; i < code.length; i++) {
      const fontSize = 24 + Math.floor(Math.random() * 6);
      ctx.font = `${fontSize}px Arial`;
      ctx.fillStyle = `rgb(${Math.random() * 150},${Math.random() * 150},${Math.random() * 150})`;
      const angle = (Math.random() - 0.5) * 0.6; // qiyshiq
      ctx.save();
      ctx.translate(30 * i + 15, 30);
      ctx.rotate(angle);
      ctx.fillText(code[i], -10, 0);
      ctx.restore();
    }

    // Chalkash chiziqlar
    for (let i = 0; i < 4; i++) {
      ctx.strokeStyle = `rgb(${Math.random() * 200},${Math.random() * 200},${Math.random() * 200})`;
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.stroke();
    }
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleRegister = (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Parol mos kelmadi!");
      return;
    }

    if (captchaInput.toUpperCase() !== captcha) {
      toast.error("Captcha noto‘g‘ri!");
      generateCaptcha();
      return;
    }

    if (phone && password) {
      toast.success("Siz muvaffaqiyatli ro‘yxatdan o‘tdingiz, endi tizimga kiring!");
      setIsAuthenticated(true);
      localStorage.setItem("token", "true");
      setTimeout(() => navigate("/login"), 2000);
    } else {
      toast.error("Barcha maydonlarni to‘ldiring!");
    }
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={2000} />
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="w-full max-w-sm bg-white shadow-lg rounded-2xl p-6 space-y-6">
          <h2 className="text-2xl font-bold text-center">Ro‘yxatdan o‘tish</h2>

          <form onSubmit={handleRegister} className="space-y-4">
            <PhoneInput
              country={"uz"}
              value={phone}
              onChange={setPhone}
              enableSearch={true}
              inputStyle={{
                width: "100%",
                borderRadius: "0.5rem",
                padding: "0.75rem",
                paddingLeft: "3.5rem",
              }}
            />

            <input
              type="password"
              placeholder="Parol"
              className="w-full px-3 py-2 border rounded-lg"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <input
              type="password"
              placeholder="Parolni tasdiqlang"
              className="w-full px-3 py-2 border rounded-lg"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            {/* Captcha */}
            <div className="flex items-center justify-between">
              <canvas
                ref={captchaCanvas}
                width="180"
                height="40"
                className="border rounded-lg"
              ></canvas>
              <button
                type="button"
                className="ml-2 text-sm text-blue-600 underline"
                onClick={generateCaptcha}
              >
                Yangilash
              </button>
            </div>

            <input
              type="text"
              placeholder="Captcha kodini kiriting"
              className="w-full px-3 py-2 border rounded-lg"
              value={captchaInput}
              onChange={(e) => setCaptchaInput(e.target.value)}
            />

            <button type="submit" className="w-full bg-black text-white py-2 rounded-lg">
              Ro‘yxatdan o‘tish
            </button>
          </form>

          <p className="text-center text-sm">
            Akkountingiz bormi?{" "}
            <Link to="/login" className="text-blue-600 underline">
              Kirish
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
