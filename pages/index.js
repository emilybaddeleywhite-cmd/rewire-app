                    <div style={{ fontSize: '12px', color: C.textBody }}>{product?.duration} · {MUSIC[product?.id]?.label}</div>
                  </div>
                </div>
                {[['Intention', activeGoal], ['Voice', isSubliminal ? 'Emily (default for subliminal)' : selectedVoice?.name], ['Mood', `${mood}/10 — ${moodLabel}`]].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '12px' }}>
                    <span style={{ color: C.textBody }}>{k}</span><span style={{ color: C.textH, fontWeight: '500' }}>{v}</span>
                  </div>
                ))}
                {isWalking && (
                  <div style={{ padding: '12px 14px', borderRadius: '10px', background: 'rgba(41,186,239,0.06)', border: '1px solid rgba(41,186,239,0.2)', marginTop: '8px' }}>
                    <div style={{ fontSize: '12px', color: C.cyanLight, lineHeight: 1.6 }}>⚠️ Designed for walking outdoors. Your awareness stays fully active throughout. Do not use while driving.</div>
                  </div>
                )}
                <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: '14px', marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: C.textBody }}>Cost</span>
                  <span style={{ color: p.color, fontWeight: '700', fontSize: '15px' }}>✦ {product?.credits} credit{product?.credits > 1 ? 's' : ''}</span>
                </div>
                {profile && (
                  <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '12px', color: C.textMuted }}>Your balance</span>
                    <span style={{ fontSize: '12px', color: C.textMuted }}>✦ {profile.credits} remaining</span>
                  </div>
                )}
              </div>
              {error && <p style={{ color: '#ff6b6b', fontSize: '13px', marginBottom: '12px', textAlign: 'center' }}>{error}</p>}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setStep(isSubliminal ? 1 : 3)} style={{ padding: '15px 18px', borderRadius: '12px', border: `1px solid ${C.border}`, color: C.textMuted, fontSize: '14px' }}>← Back</button>
                <button onClick={startGenerate} style={{ flex: 1, padding: '15px', borderRadius: '12px', background: p.grad, color: '#fff', fontSize: '15px', fontWeight: '800', boxShadow: `0 4px 24px ${p.glow}`, letterSpacing: '0.02em' }}>
                  {user ? '✦ Generate My Audio' : '✦ Sign Up Free and Generate'}
                </button>
              </div>
              {safetyState?.type === 'crisis' && <CrisisBlock onDismiss={clearSafety} />}
              {safetyState?.type === 'block' && <SafetyBlock category={safetyState.category} suggestedRewrite={safetyState.suggestedRewrite} onUseRewrite={(r) => { setGoal('custom'); setCustomGoal(r); clearSafety() }} onDismiss={clearSafety} />}
            </div>
          )}
          {/* STEP 5: LOADING */}
          {step === 5 && (
            <div style={{ animation: 'fadeUp 0.5s ease both', textAlign: 'center', padding: isMobile ? '20px 0' : '40px 0' }}>
              <div style={{ position: 'relative', width: '90px', height: '90px', margin: '0 auto 32px' }}>
                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `2px solid ${p.color}33`, borderTopColor: p.color, animation: 'spin 1.4s linear infinite' }} />
                <div style={{ position: 'absolute', inset: '12px', borderRadius: '50%', border: `1px solid ${p.colorB}44`, borderBottomColor: p.colorB, animation: 'spinR 2s linear infinite' }} />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>{product?.emoji}</div>
              </div>
              <div style={{ minHeight: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px', padding: '0 20px' }}>
                <div key={loadMsgIndex} style={{ fontSize: isMobile ? '14px' : '15px', color: p.color, fontWeight: '600', animation: 'fadeMsg 3.5s ease both', maxWidth: '420px', lineHeight: 1.6, textAlign: 'center' }}>{currentLoadMsg}</div>
              </div>
              <p style={{ fontSize: '12px', color: C.textMuted, marginBottom: '36px' }}>Your session is built fresh every time. This takes 60 to 90 seconds.</p>
              <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '100px', height: '4px', overflow: 'hidden', marginBottom: '10px', maxWidth: '400px', margin: '0 auto 10px' }}>
                <div style={{ height: '100%', width: `${progress}%`, background: p.grad, borderRadius: '100px', transition: 'width 0.8s ease', boxShadow: `0 0 10px ${p.color}` }} />
              </div>
              <div style={{ fontSize: '11px', color: C.textMuted, fontFamily: 'monospace' }}>{Math.round(progress)}%</div>
            </div>
          )}
          {/* STEP 6: RESULT */}
          {step === 6 && (
            <div style={{ animation: 'fadeUp 0.6s ease both' }}>
              {error ? (
                <div style={{ padding: '24px', borderRadius: '16px', background: 'rgba(255,60,60,0.06)', border: '1px solid rgba(255,80,80,0.2)', marginBottom: '16px', textAlign: 'center' }}>
                  <div style={{ fontSize: '28px', marginBottom: '10px' }}>⚠️</div>
                  <div style={{ fontSize: '14px', color: '#ff8a80', marginBottom: '16px' }}>{error}</div>
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button onClick={resetApp} style={{ padding: '10px 24px', borderRadius: '10px', background: 'rgba(255,255,255,0.08)', color: C.textH, fontSize: '13px', fontWeight: '600' }}>Try Again</button>
                    <button onClick={async () => { await fetch('/api/report-bug', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error, userId: user?.id, productType: product?.id, goal: activeGoal }) }); alert('Bug reported. Thank you!') }} style={{ padding: '10px 24px', borderRadius: '10px', background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.3)', color: '#ff8a80', fontSize: '13px', fontWeight: '600' }}>🐛 Report Bug</button>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ textAlign: 'center', marginBottom: '24px', padding: '24px', borderRadius: '18px', background: p.color + '08', border: `1px solid ${p.color}33`, boxShadow: `0 0 40px ${p.glow}` }}>
                    <div style={{ fontSize: '40px', marginBottom: '10px' }}>{product?.emoji}</div>
                    <div style={{ fontFamily: "'Sora',sans-serif", fontSize: '20px', color: p.color, fontWeight: '800', marginBottom: '5px' }}>Your {product?.label} is ready</div>
                    <div style={{ fontSize: '12px', color: C.textBody }}>{isSubliminal ? 'Emily' : selectedVoice?.name} · {MUSIC[product?.id]?.label} · Mood {mood}/10</div>
                    {savedOk && <div style={{ marginTop: '10px', fontSize: '12px', color: '#34d399', fontWeight: '600' }}>✓ Saved to your library · <a href="/dashboard" style={{ color: '#34d399' }}>View library →</a></div>}
                  </div>
                  <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '22px 24px', marginBottom: '14px', maxHeight: '200px', overflowY: 'auto' }}>
                    <div style={{ fontSize: '10px', letterSpacing: '0.15em', color: p.color, marginBottom: '12px', fontWeight: '600' }}>YOUR SCRIPT</div>
                    <div style={{ fontSize: '15px', lineHeight: '2', color: C.textBody, whiteSpace: 'pre-wrap', fontFamily: "'Georgia',serif" }}>{script}</div>
                  </div>
                  <div style={{ background: C.bgCard, border: `1px solid ${p.color}22`, borderRadius: '14px', padding: '18px 20px', marginBottom: '12px' }}>
                    <Waveform active={playing} product={product} />
                    {playing && (
                      <>
                        <div style={{ textAlign: 'center', marginTop: '10px', marginBottom: '14px' }}>
                          <div style={{ fontSize: '12px', color: p.color, fontFamily: 'monospace', marginBottom: '3px' }}>{fmt(timer)} — Session in progress</div>
                          <div style={{ fontSize: '11px', color: C.textMuted, fontStyle: 'italic' }}>{isSubliminal ? 'Relax and let the music wash over you.' : isWalking ? 'Keep your eyes open. Walk at your own pace.' : 'Close your eyes. Breathe slowly. Let the words reach you.'}</div>
                        </div>
                        {!isSubliminal && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '11px', color: C.textMuted, whiteSpace: 'nowrap' }}>🎵 Music</span>
                            <style>{`input[type=range].mv{background:linear-gradient(to right,${p.color},${p.color}33)} input[type=range].mv::-webkit-slider-thumb{background:${p.color};border:none;width:14px;height:14px}`}</style>
                            <input type="range" min="0" max="0.4" step="0.01" value={musicVolume} onChange={e => setMusicVolume(Number(e.target.value))} className="mv" style={{ flex: 1, height: '3px' }} />
                            <span style={{ fontSize: '11px', color: C.textMuted, whiteSpace: 'nowrap' }}>{Math.round(musicVolume * 250)}%</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                    <button onClick={togglePlay} disabled={!audioUrl} style={{ flex: 1, padding: isMobile ? '14px' : '15px', borderRadius: '12px', background: audioUrl ? p.grad : 'rgba(255,255,255,0.04)', color: '#fff', fontSize: isMobile ? '14px' : '15px', fontWeight: '800', boxShadow: audioUrl && !playing ? `0 4px 20px ${p.glow}` : 'none' }}>{playing ? '⏸ Pause' : '▶ Play'}</button>
                    <button onClick={replaySession} title="Replay from start" style={{ padding: '14px 16px', borderRadius: '12px', border: `1px solid ${C.border}`, color: C.textMuted, fontSize: '14px' }}>↩</button>
                    <button onClick={resetApp} title="New session" style={{ padding: '14px', borderRadius: '12px', border: `1px solid ${C.border}`, color: C.textMuted, fontSize: isMobile ? '11px' : '12px', fontWeight: '600', whiteSpace: 'nowrap' }}>{isMobile ? '+' : 'New'}</button>
                  </div>
                  {isSubliminal && (
                    <button onClick={() => { const n = !looping; setLooping(n); if (audioRef.current) audioRef.current.loop = n }} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: `1px solid ${looping ? SUBLIMINAL_PRODUCT.color + '44' : C.border}`, background: looping ? SUBLIMINAL_PRODUCT.color + '10' : 'transparent', color: looping ? SUBLIMINAL_PRODUCT.color : C.textMuted, fontSize: '13px', fontWeight: '600', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      {looping ? '🔁 Loop On — tap to turn off' : '↩ Loop Off — tap to turn on'}
                    </button>
                  )}
                  {saveLimitHit && (
                    <div style={{ padding: '12px 16px', borderRadius: '12px', background: 'rgba(255,159,67,0.08)', border: '1px solid rgba(255,159,67,0.25)', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                      <div style={{ fontSize: '13px', color: '#ff9f43' }}>⚠️ Your session played but could not be saved — you have reached your free plan limit.</div>
                      <a href="/pricing" style={{ fontSize: '12px', color: '#ff9f43', fontWeight: '700', textDecoration: 'none', whiteSpace: 'nowrap', border: '1px solid rgba(255,159,67,0.4)', padding: '5px 10px', borderRadius: '8px' }}>Upgrade →</a>
                    </div>
                  )}
                  <div style={{ padding: '13px 16px', borderRadius: '12px', background: C.bgCard, border: `1px solid ${C.border}`, marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '13px', color: C.textBody }}>🔥 <strong style={{ color: p.color }}>{streak} day{streak !== 1 ? 's' : ''}</strong> in Rewrite Mode</div>
                    {profile && <div style={{ fontSize: '13px', color: p.color, fontWeight: '600', cursor: 'pointer' }} onClick={() => setShowCredits(true)}>✦ {profile.credits} credits</div>}
                  </div>
                  {(!profile || profile.plan === 'free') && (
                    <div style={{ padding: '16px 18px', borderRadius: '14px', border: '1px solid rgba(123,79,224,0.25)', background: 'rgba(123,79,224,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                      <div>
                        <div style={{ fontSize: '13px', color: C.purpleLight, marginBottom: '3px', fontWeight: '700' }}>💎 Go Pro — £14.99/month</div>
                        <div style={{ fontSize: '11px', color: C.textBody, lineHeight: 1.6 }}>100 credits/mo · Save 50 sessions · Daily sessions for less than a coffee a week</div>
                      </div>
                      <button onClick={() => window.location.href = '/pricing'} style={{ padding: '9px 16px', borderRadius: '10px', background: C.grad, color: '#fff', fontSize: '12px', whiteSpace: 'nowrap', fontWeight: '700' }}>Upgrade →</button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
          <div style={{ textAlign: 'center', marginTop: '52px', display: 'flex', justifyContent: 'center', gap: '16px', fontSize: '12px', flexWrap: 'wrap' }}>
            {[['Terms', '/terms'], ['Privacy', '/privacy'], ['FAQ', '/faq'], ['Pricing', '/pricing'], ['Contact', '/contact']].map(([l, h]) => (
              <a key={l} href={h} style={{ color: C.textMuted, textDecoration: 'none' }}>{l}</a>
            ))}
          </div>
          {user && <div style={{ textAlign: 'center', marginTop: '16px' }}><FeedbackButton userId={user?.id} /></div>}
        </div>
      </div>
      {showDisclaimer && <DisclaimerModal onAccept={acceptDisclaimer} />}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} onSuccess={() => { setShowAuth(false); setView('app') }} />}
      {showCredits && user && <CreditsModal profile={profile} user={user} onClose={() => setShowCredits(false)} />}
      {showQuiz && <QuizModal onClose={() => setShowQuiz(false)} onSelect={(g) => { if (g === 'custom') setGoal('custom'); else setGoal(g); setShowQuiz(false) }} />}
    </>
  )
}
