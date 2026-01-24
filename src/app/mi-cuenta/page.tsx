import MiCuentaClient from '@/app/mi-cuenta/MiCuentaClient'


export default async function MiCuentaPage() {
    const resSucursales = await fetch(`${process.env.STRAPI_URL_API}/sucursals?sort=posicion:asc&populate=*`);
    const { data: sucursales } = await resSucursales.json();

    return (
        <>
            <MiCuentaClient sucursales={sucursales}/>
        </>
    )
}

