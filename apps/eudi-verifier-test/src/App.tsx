import { useState, useEffect } from 'react'
import { QRCodeCanvas } from 'qrcode.react'

// Definujeme si stavy pre našu UI
type VerificationState =
  | 'idle' // Čaká na vstup
  | 'loading_qr' // Načítava QR kód
  | 'waiting_for_scan' // Zobrazuje QR kód a čaká na sken (polluje)
  | 'verified' // Výsledok: Overené
  | 'not_verified' // Výsledok: Neoverené
  | 'error' // Chyba

// Typ pre odpoveď zo /verify-status
interface StatusResponse {
  status: 'pending' | 'verified' | 'not_verified' | 'error';
  result: any | null;
}

function App() {
  const [companyIco, setCompanyIco] = useState<string>('54321098') // Zmenené na IČO pre eGarant (Ján Nováček)
  const [transactionId, setTransactionId] = useState<string | null>(null)
  const [currentState, setCurrentState] = useState<VerificationState>('idle')
  const [error, setError] = useState<string | null>(null)
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)
  const [verificationResult, setVerificationResult] = useState<any>(null)


  // === POLLING LOGIKA (TERAZ UŽ REÁLNA) ===
  useEffect(() => {
    // Ak nie sme v stave čakania alebo nemáme ID, nerob nič
    if (currentState !== 'waiting_for_scan' || !transactionId) {
      return
    }

    console.log(`[POLL] Začínam sledovať stav pre transakciu: ${transactionId}`)
    
    // Spustíme interval, ktorý sa pýta na stav každé 2 sekundy
    const intervalId = setInterval(async () => {
      try {
        console.log(`[POLL] Pýtam sa na stav: /api/v1/verify-status/${transactionId}`)
        
        // KROK 8.3.3: Voláme REÁLNY endpoint na zistenie stavu
        const response = await fetch(`/api/v1/verify-status/${transactionId}`, {
           headers: { 'X-API-Key': 'test-key-12345' },
        })

        if (!response.ok) {
          throw new Error(`Chyba pri dopyte na stav: ${response.statusText}`)
        }
        
        const data: StatusResponse = await response.json()

        // Kontrolujeme, či je transakcia stále 'pending'
        if (data.status === 'pending') {
          console.log('[POLL] Stav je stále "pending"...')
          return // Pokračujeme v pollingu
        }

        // Ak už stav nie je 'pending', máme výsledok!
        console.log('[POLL] Prijatý finálny stav:', data.status, data.result)
        
        // Uložíme výsledok
        setVerificationResult(data.result)
        
        // Zastavíme polling
        clearInterval(intervalId)

        // Aktualizujeme UI podľa výsledku
        if (data.status === 'verified') {
          setCurrentState('verified')
        } else if (data.status === 'not_verified') {
          setCurrentState('not_verified')
        } else {
          // 'error'
          setError(data.result?.error || 'Neznáma chyba pri overení')
          setCurrentState('error')
        }

      } catch (err: any) {
        setError('Nepodarilo sa získať stav: ' + err.message)
         setCurrentState('error')
        clearInterval(intervalId) // Zastavíme aj pri chybe
      }
    }, 2000) // Poll každé 2 sekundy

    // Dôležité: Keď sa komponent zmení (alebo odíde), zastavíme interval
    return () => {
      console.log('[POLL] Zastavujem sledovanie.')
      clearInterval(intervalId)
    }
  }, [currentState, transactionId])


  // === UPRAVENÁ FUNKCIA ===
  const handleStartVerification = async () => {
    console.log(`Spúšťam overenie mandátu pre IČO: ${companyIco}`)
    setCurrentState('loading_qr')
    setError(null)
    setQrCodeUrl(null)
    setTransactionId(null) // Resetujeme staré ID

    try {
      const response = await fetch('/api/v1/verify-mandate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'test-key-12345',
        },
        // Posielame IČO v tele požiadavky
        body: JSON.stringify({ companyIco: companyIco }),
      })

      if (!response.ok) {
        throw new Error(`Chyba servera: ${response.statusText}`)
      }

      const data = await response.json();

      // KROK 9.5: Očakávame odpoveď v tvare: { transactionId: "...", requestUri: "..." }
      if (data.requestUri && data.transactionId) {
        // Zostavíme URL pre QR kód podľa OpenID4VP špecifikácie
        const generatedQrCodeUrl = `openid4vp://?request_uri=${data.requestUri}`;

        setQrCodeUrl(generatedQrCodeUrl); // Uložíme URL pre QR kód
        setTransactionId(data.transactionId); // ULOŽÍME SI ID TRANSAKCIE
        setCurrentState('waiting_for_scan'); // Tento stav teraz spustí reálny polling

        console.log('Prijatá Request URI:', data.requestUri);
        console.log('Prijaté ID transakcie:', data.transactionId);
        console.log('Vygenerovaná URL pre QR kód:', generatedQrCodeUrl);

      } else {
        // Ak chýba niektoré pole, vyhodíme chybu
        throw new Error('Odpoveď z API neobsahovala transactionId alebo requestUri');
      }
    } catch (err: any) {
      console.error('Nepodarilo sa získať QR kód:', err)
      setError(err.message)
      setCurrentState('error')
    }
  }
  
  const handleReset = () => {
    setCurrentState('idle')
    setError(null)
    setQrCodeUrl(null)
    setTransactionId(null)
    setVerificationResult(null)
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '600px' }}>
      <h1>EUDI Verifier Test</h1>

      {currentState === 'idle' && (
        <div>
          <p>Zadajte IČO firmy, pre ktorú chcete overiť mandát:</p>
          <div>
            <input
              type="text"
              value={companyIco}
              onChange={(e) => setCompanyIco(e.target.value)}
              style={{ fontSize: '1.2rem', padding: '10px', width: '300px' }}
              placeholder="Napr. 54321098"
            />
          </div>
          <button
            onClick={handleStartVerification}
            style={{ fontSize: '1.2rem', padding: '10px', marginTop: '1rem' }}
            disabled={!companyIco}
          >
            Spustiť overenie mandátu
          </button>
        </div>
      )}
      
      {currentState === 'loading_qr' && (
        <p>Iniciujem... (Volám backend /api/v1/verify-mandate)</p>
      )}

      {currentState === 'waiting_for_scan' && (
        <div>
          <h3>Naskenujte tento QR kód testovacou EUDI peňaženkou:</h3>
          <p>Čakám na odpoveď z peňaženky (Polling /api/v1/verify-status...)</p>
          <div style={{ padding: '1rem', backgroundColor: 'white', display: 'inline-block', border: '1px solid #ccc' }}>
            {qrCodeUrl ? (
              <QRCodeCanvas value={qrCodeUrl} size={256} />
            ) : (
              'Chyba: QR kód URL chýba'
            )}
          </div>
          <p style={{ wordBreak: 'break-all', fontSize: '0.8rem', color: '#555', maxWidth: '300px' }}>
            <b>Transaction ID:</b> {transactionId}
          </p>
          <button onClick={handleReset} style={{ marginTop: '1rem' }}>Zrušiť</button>
        </div>
      )}
      
      {/* Zjednotené zobrazenie pre finálne stavy */}
      {(currentState === 'verified' || currentState === 'not_verified') && (
        <div>
          <h2>Overenie dokončené!</h2>
          <div style={{ padding: '1rem', border: `3px solid ${currentState === 'verified' ? 'green' : 'red'}` }}>
            <p><strong>Stav:</strong> {currentState.toUpperCase()}</p>
            <p><strong>Overená osoba:</strong> {verificationResult?.personName || 'Neznáma'}</p>
            <p><strong>Firma IČO:</strong> {verificationResult?.companyIco || companyIco}</p>
            <p><strong>Názov firmy:</strong> {verificationResult?.companyName || 'N/A'}</p>
            <p><strong>Rola:</strong> {verificationResult?.role || 'N/A'}</p>
          </div>
          <button onClick={handleReset} style={{ marginTop: '1rem' }}>Nové overenie</button>
        </div>
      )}

      {currentState === 'error' && (
        <div>
          <h2 style={{ color: 'red' }}>Chyba</h2>
          <p style={{ color: 'red' }}>{error}</p>
          <p>Detail: {verificationResult?.error || 'Bez detailov'}</p>
          <button onClick={handleReset} style={{ marginTop: '1rem' }}>Skúsiť znova</button>
        </div>
      )}

    </div>
  )
}

export default App