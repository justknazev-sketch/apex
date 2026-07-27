import { NextResponse } from 'next/server';

const NP_API_URL = 'https://api.novaposhta.ua/v2.0/json/';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const apiKey = process.env.NOVA_POSHTA_API_KEY || '';

    if (action === 'cities') {
      const q = searchParams.get('q') || '';
      if (!q || q.trim().length < 2) {
        return NextResponse.json({ success: true, cities: [] });
      }

      const res = await fetch(NP_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey,
          modelName: 'Address',
          calledMethod: 'searchSettlements',
          methodProperties: {
            CityName: q.trim(),
            Limit: '25',
            Page: '1'
          }
        }),
        next: { revalidate: 3600 }
      });

      if (!res.ok) {
        return NextResponse.json({ success: false, cities: [] });
      }

      const data = await res.json();
      if (!data.success || !data.data?.[0]?.Addresses) {
        return NextResponse.json({ success: true, cities: [] });
      }

      const cities = data.data[0].Addresses.map((item: any) => ({
        present: item.Present, // e.g. "м. Київ, Київська обл."
        mainDescription: item.MainDescription, // e.g. "Київ"
        deliveryCityRef: item.DeliveryCity,
        ref: item.Ref
      }));

      return NextResponse.json({ success: true, cities });
    }

    if (action === 'warehouses') {
      const cityRef = searchParams.get('cityRef') || '';
      const cityName = searchParams.get('cityName') || '';
      const q = searchParams.get('q') || '';

      if (!cityRef && !cityName) {
        return NextResponse.json({ success: true, warehouses: [] });
      }

      const methodProperties: any = {
        Limit: '250'
      };

      if (cityRef) {
        methodProperties.CityRef = cityRef;
      } else if (cityName) {
        methodProperties.CityName = cityName;
      }

      if (q) {
        methodProperties.FindByString = q;
      }

      const res = await fetch(NP_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey,
          modelName: 'Address',
          calledMethod: 'getWarehouses',
          methodProperties
        }),
        next: { revalidate: 3600 }
      });

      if (!res.ok) {
        return NextResponse.json({ success: false, warehouses: [] });
      }

      const data = await res.json();
      if (!data.success || !Array.isArray(data.data)) {
        return NextResponse.json({ success: true, warehouses: [] });
      }

      const warehouses = data.data.map((item: any) => ({
        description: item.Description, // e.g. "Відділення №1: вул. Пирогівський шлях, 135"
        number: item.Number,
        ref: item.Ref
      }));

      return NextResponse.json({ success: true, warehouses });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Nova Poshta API error:', error);
    return NextResponse.json({ success: false, cities: [], warehouses: [] });
  }
}
