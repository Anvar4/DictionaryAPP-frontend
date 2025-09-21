import { FiLogOut, FiBookOpen, FiLayers, FiTag, FiEdit3 } from 'react-icons/fi'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom' // Qo'shildi

export default function Sidebar({
	activeSection,
	setActiveSection,
	handleLogout,
}) {
	const navigate = useNavigate() // Qo'shildi

	// Navigatsiya va activeSection birga o'zgaradi
	const handleSection = section => {
		setActiveSection(section)
		if (section === 'lugat') navigate('/dictionaries')
		if (section === 'bolimlar') navigate('/departments')
		if (section === 'kategoriyalar') navigate('/categories')
		if (section === "so'zlar") navigate('/words')
	}

	return (
		<aside className='w-64 bg-gray-100 p-4 flex flex-col justify-between h-screen'>
			<nav className='space-y-3'>
				<img
					className='w-35 h-35 rounded-full object-cover mx-auto mb-4'
					src='/public/logo.png'
					alt='Logo'
				/>
				<ul className='space-y-2'>
					<li
						className={`cursor-pointer flex items-center gap-2 font-semibold rounded px-2 py-2 transition-colors ${
							activeSection === 'lugat'
								? 'bg-gray-300 text-blue-700'
								: 'hover:text-blue-600'
						}`}
						onClick={() => handleSection('lugat')}
					>
						<FiBookOpen className='text-lg' /> Lug‘at
					</li>
					<li
						className={`cursor-pointer flex items-center gap-2 font-semibold rounded px-2 py-2 transition-colors ${
							activeSection === 'bolimlar'
								? 'bg-gray-300 text-blue-700'
								: 'hover:text-blue-600'
						}`}
						onClick={() => handleSection('bolimlar')}
					>
						<FiLayers className='text-lg' /> Bo‘limlar
					</li>
					<li
						className={`cursor-pointer flex items-center gap-2 font-semibold rounded px-2 py-2 transition-colors ${
							activeSection === 'kategoriyalar'
								? 'bg-gray-300 text-blue-700'
								: 'hover:text-blue-600'
						}`}
						onClick={() => handleSection('kategoriyalar')}
					>
						<FiTag className='text-lg' /> Kategoriyalar
					</li>
					<li
						className={`cursor-pointer flex items-center gap-2 font-semibold rounded px-2 py-2 transition-colors ${
							activeSection === "so'zlar"
								? 'bg-gray-300 text-blue-700'
								: 'hover:text-blue-600'
						}`}
						onClick={() => handleSection("so'zlar")}
					>
						<FiEdit3 className='text-lg' /> So‘zlar
					</li>
				</ul>
			</nav>
			<Button
				variant='ghost'
				className='text-red-500 flex items-center gap-2'
				onClick={handleLogout}
			>
				<FiLogOut className='text-xl' />
				Chiqish
			</Button>
		</aside>
	)
}
