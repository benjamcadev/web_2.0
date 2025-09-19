import Banner from '@/components/Banner';
import Header from '../components/Header'


export default function Home() {

  
  return (
    <main className="">
      <div className=" flex flex-row bg-blue-800 rounded-b-2xl text-amber-50 font-sans font-light text-xs h-6 w-full text-center p-1">
        <p className=" mx-auto">Horario Continuado: Lunes a Viernes · 9:00 - 17:00 hrs. · Sábado · 9:00 - 14:00 hrs.</p>
      </div>

    <Header /> 
    <Banner />  

    </main>
  );
}
