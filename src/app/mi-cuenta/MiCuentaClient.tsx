'use client'

import { useState } from 'react'
import Header from '@/components/client/Header/Header'
import Horarios from '@/components/client/Horarios'
import DatosPersonales from '@/components/client/mi-cuenta/DatosPersonales'
import Direcciones from '@/components/client/mi-cuenta/Direcciones'
import Pedidos from '@/components/client/mi-cuenta/Pedidos'
import Sidebar from '@/components/client/mi-cuenta/Sidebar'
import Credito from '@/components/client/mi-cuenta/Credito'

type Section = 'datos' | 'direcciones' | 'pedidos' | 'credito'


export default function MiCuentaClient({ sucursales }: any) {

    const [section, setSection] = useState<Section>('datos');
    
    
    return (
        < main >
            <Horarios sucursales={sucursales} />
            <Header />

            <div className="max-w-7xl mx-auto mt-8 px-4">
                <div className="flex flex-col md:flex-row gap-6">

                    {/* Sidebar */}
                    <Sidebar 
                    setSection={setSection}
                    section={section}
                    />

                    {/* Content */}
                    <main className="flex-1 rounded-2xl bg-white/50 backdrop-blur-xl border border-white/30 p-6">
                        {section === 'datos' && <DatosPersonales />}
                        {section === 'direcciones' && <Direcciones />}
                        {section === 'pedidos' && <Pedidos />}
                        {section === 'credito' && <Credito />}
                    </main>
                </div>
            </div>
        </main >
    )
}


