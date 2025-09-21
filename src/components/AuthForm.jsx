import { useState } from 'react'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { api } from '@/utils/api'
import { useNavigate } from 'react-router-dom'

export default function AuthForm({ isLogin }) {
	const [phone, setPhone] = useState('')
	const [password, setPassword] = useState('')
	// const [error, setError] = useState("");
	const [loading, setLoading] = useState(false)
	const navigate = useNavigate()

	const handleSubmit = async e => {
		e.preventDefault()
		setLoading(true)
		// setError("");

		try {
			const res = await api.post(`/auth/${isLogin ? 'login' : 'register'}`, {
				phone,
				password,
			})

			localStorage.setItem('token', res.data.token)
			toast.success(
				isLogin
					? 'Muvaffaqiyatli kirildi!'
					: 'Ro‘yxatdan o‘tish muvaffaqiyatli!'
			)
			setTimeout(() => navigate('/dashboard'), 1000)
		} catch (err) {
			const msg = err.response?.data?.message || 'Xatolik yuz berdi'
			// setError(msg);
			toast.error(msg)
		} finally {
			setLoading(false)
		}
	}

	return (
		<>
			<ToastContainer
				position='top-center'
				autoClose={2000}
				hideProgressBar={false}
				newestOnTop
				closeOnClick
				pauseOnFocusLoss
				draggable
				pauseOnHover
			/>
			<Card className='w-[400px] mx-auto mt-20 shadow-lg'>
				<CardHeader>
					<CardTitle className='text-center'>
						{isLogin ? 'Kirish' : 'Ro‘yxatdan o‘tish'}
					</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className='space-y-4'>
						<Input
							type='text'
							placeholder='Telefon raqam'
							value={phone}
							onChange={e => setPhone(e.target.value)}
						/>
						<Input
							type='password'
							placeholder='Parol'
							value={password}
							onChange={e => setPassword(e.target.value)}
						/>
						{isLogin && (
							<div className='text-center'>
								<button
									type='button'
									onClick={() => navigate('/register')}
									className='text-blue-600 underline text-sm'
								>
									Ro‘yxatdan o‘tish
								</button>
							</div>
						)}
						<Button type='submit' className='w-full' disabled={loading}>
							{loading
								? 'Yuklanmoqda...'
								: isLogin
								? 'Kirish'
								: 'Ro‘yxatdan o‘tish'}
						</Button>
					</form>
				</CardContent>
			</Card>
		</>
	)
}
