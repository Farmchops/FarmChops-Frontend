import React, { useState } from "react";
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '@/redux/store';
import farmerHeroFallback from "../assets/AboutIcon/forfarmer.png";

const BecomeFarmer: React.FC = () => {
  const [items, setItems] = useState<string[]>([""]);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    address: "",
    nationality: "",
    nin: "",
    phone: "",
    email: "",
  });
  const navigate = useNavigate();

  // If a user is logged in, include their token when submitting (backend will attach farmer.user)
  const token = useSelector((state: RootState) => state.auth.token);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleItemChange = (idx: number, value: string) => {
    const newItems = [...items];
    newItems[idx] = value;
    setItems(newItems);
  };

  const addItem = () => setItems([...items, ""]);
  const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // basic validation (form fields already have required attr but double-check)
    if (!form.firstName.trim() || !form.address.trim()) {
      alert('Please provide both first name and address.');
      return;
    }

    const payload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim() || undefined,
      gender: form.gender || undefined,
      address: form.address.trim(),
      phone: form.phone?.trim() || undefined,
      email: form.email?.trim() || undefined,
      nationality: form.nationality || undefined,
      nin: form.nin?.trim() || undefined,
      items: items
        .map((it) => it.trim())
        .filter(Boolean)
        .map((name) => ({ name, description: '', unit: 'kg' })),
    };

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/farmers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (res.status === 201) {
        // success - parse response and navigate to thank you page with created farmer data
        const data = await res.json().catch(() => null);
        const farmer = data?.data || null;
        // navigate and pass farmer in state so thank-you can show details
        navigate('/thank-you', { state: { farmer } });
      } else if (res.status === 400) {
        const err = await res.json().catch(() => null);
        alert(err?.message || 'Validation error. Please check your input.');
      } else {
        const err = await res.json().catch(() => null);
        alert(err?.message || 'Something went wrong. Please try again later.');
      }
    } catch (error) {
      console.error('Create farmer failed', error);
      alert('Network error. Please try again.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-0 bg-white rounded-lg shadow mt-8 overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 items-stretch">
        <div className="order-1 md:order-0 overflow-hidden">
          <img
            src="/farmer-hero.png"
            alt="Farmers holding produce"
            className="w-full h-80 md:h-full object-cover block object-[25%_center]"
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = farmerHeroFallback; }}
          />
        </div>
        <div className="bg-white p-6 flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-[#1D7B3C] mb-2">Become a Vendor</h2>
          <p className="mb-6 text-gray-700">
            Are you a farmer or producer of quality goods and produce? Would you like to join the FarmChops team? Let's get you started!
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium mb-1">First name</label>
                <input name="firstName" value={form.firstName} onChange={handleChange} required className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block font-medium mb-1">Last name</label>
                <input name="lastName" value={form.lastName} onChange={handleChange} required className="w-full border rounded px-3 py-2" />
              </div>
            </div>
            <div>
              <label className="block font-medium mb-1">Gender</label>
              <select name="gender" value={form.gender} onChange={handleChange} required className="w-full border rounded px-3 py-2">
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block font-medium mb-1">Address</label>
              <input name="address" value={form.address} onChange={handleChange} required className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block font-medium mb-1">Phone number</label>
              <input name="phone" value={form.phone} onChange={handleChange} placeholder="e.g. +2348012345678" className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block font-medium mb-1">Email</label>
              <input name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" type="email" className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block font-medium mb-1">Nationality</label>
              <input name="nationality" value={form.nationality} onChange={handleChange} required className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block font-medium mb-1">NIN</label>
              <input name="nin" value={form.nin} onChange={handleChange} required className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block font-medium mb-1">Items/Produce for Sale</label>
              {items.map((item, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={item}
                    onChange={e => handleItemChange(idx, e.target.value)}
                    placeholder="e.g. Tomatoes, Yams"
                    className="flex-1 border rounded px-3 py-2"
                    required
                  />
                  {items.length > 1 && (
                    <button type="button" onClick={() => removeItem(idx)} className="text-red-500 px-2">Remove</button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addItem} className="text-[#1D7B3C] font-medium">+ Add another item</button>
            </div>
            <button type="submit" className="w-full bg-[#1D7B3C] text-white py-2 rounded font-semibold hover:bg-green-800 transition">Submit</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BecomeFarmer;
