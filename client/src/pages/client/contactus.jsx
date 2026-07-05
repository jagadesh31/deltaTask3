import { useState } from 'react'
import { MdEmail, MdPhone, MdLocationOn } from 'react-icons/md'
import { FiSend } from 'react-icons/fi'
import { FaInstagram, FaTwitter, FaLinkedin } from 'react-icons/fa'

export const ContactUs = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
    setForm({ name: '', email: '', subject: '', message: '' })
  }

  return (
    <div className="backgroundDiv text-white min-h-[80vh] flex flex-col justify-center py-16 px-4">
      <div className="w-full max-w-5xl mx-auto">

        <div className="text-center mb-16">
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-4 tracking-tight drop-shadow-sm">Get in Touch</h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto font-medium">We're here to help and answer any question you might have. We look forward to hearing from you.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-center">
          
          <div className="bg-black border-2 border-gray-700 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-2xl hover:-translate-y-2 hover:border-[#4242FA] transition-all duration-300 group">
            <div className="w-20 h-20 bg-gray-900 group-hover:bg-[#4242FA] rounded-full flex items-center justify-center mb-6 transition-colors duration-300 shadow-inner border border-gray-700">
              <MdEmail className="text-gray-300 group-hover:text-white text-3xl transition-colors duration-300" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3 tracking-wide">Email Us</h3>
            <span className="text-gray-400 text-[15px]">support@jbooking.jagadesh31.tech</span>
          </div>

          <div className="bg-black border-2 border-gray-700 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-2xl hover:-translate-y-2 hover:border-[#4242FA] transition-all duration-300 group">
            <div className="w-20 h-20 bg-gray-900 group-hover:bg-[#4242FA] rounded-full flex items-center justify-center mb-6 transition-colors duration-300 shadow-inner border border-gray-700">
              <MdPhone className="text-gray-300 group-hover:text-white text-3xl transition-colors duration-300" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3 tracking-wide">Call Us</h3>
            <span className="text-gray-400 text-[15px]">+91 6303481401</span>
          </div>

          <div className="bg-black border-2 border-gray-700 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-2xl hover:-translate-y-2 hover:border-[#4242FA] transition-all duration-300 group">
            <div className="w-20 h-20 bg-gray-900 group-hover:bg-[#4242FA] rounded-full flex items-center justify-center mb-6 transition-colors duration-300 shadow-inner border border-gray-700">
              <MdLocationOn className="text-gray-300 group-hover:text-white text-3xl transition-colors duration-300" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3 tracking-wide">Location</h3>
            <span className="text-gray-400 text-[15px]">NIT Tiruchirappalli, Tamil Nadu</span>
          </div>

        </div>

      </div>
    </div>
  )
}