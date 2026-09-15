const experiences = [
  { label: "Ask", detail: "Thoughtful questions" },
  { label: "Do", detail: "Playful challenges" },
  { label: "Notice", detail: "Look around together" },
  { label: "Dare", detail: "For the bold" },
];

export default function HomePage() {
  return (
    <main>
      <section className="hero">
        <nav className="nav" aria-label="Primary navigation">
          <a className="brand" href="#top" aria-label="SPILL home">
            SP<span>I</span>LL
          </a>
          <div className="navLinks">
            <a href="#locations">Locations</a>
            <a href="#spill-42">SPILL 42</a>
            <a href="#about">About</a>
          </div>
        </nav>

        <div className="heroContent" id="top">
          <p className="eyebrow">People · Coffee · Stories</p>
          <h1>Come together.<br /><em>See what happens.</em></h1>
          <p className="intro">Food. Drinks. Music. Conversation. Culture.</p>
          <div className="actions">
            <a className="button primary" href="#locations">Explore SPILL</a>
            <a className="button secondary" href="#spill-42">Discover SPILL 42</a>
          </div>
        </div>
        <p className="heroNote">Saigon · Open now</p>
      </section>

      <section className="section locations" id="locations">
        <p className="eyebrow">Choose your location</p>
        <div className="sectionHeading">
          <h2>Your city.<br />Your SPILL.</h2>
          <p>One global idea, shaped by the people, rhythm, and culture of every city.</p>
        </div>
        <div className="locationGrid">
          <article className="locationCard active">
            <p>01</p><div><h3>Saigon</h3><span>Open now</span></div><b>→</b>
          </article>
          <article className="locationCard">
            <p>02</p><div><h3>Tokyo</h3><span>Coming soon</span></div><b>+</b>
          </article>
          <article className="locationCard muted">
            <p>03</p><div><h3>Your city?</h3><span>Bring SPILL to your market</span></div><b>↗</b>
          </article>
        </div>
      </section>

      <section className="spill42" id="spill-42">
        <div className="sectionHeading">
          <div><p className="eyebrow">The in-venue experience</p><h2>Why 42?</h2></div>
          <p>Because 4 + 2 = SIX. Four ways to connect, built for two or more people sharing a table.</p>
        </div>
        <div className="experienceGrid">
          {experiences.map((item, index) => (
            <article key={item.label}>
              <span>0{index + 1}</span><h3>{item.label}</h3><p>{item.detail}</p>
            </article>
          ))}
        </div>
        <a className="button primary" href="/spill-42">Start the experience</a>
      </section>

      <section className="manifesto" id="about">
        <p className="eyebrow">This is SPILL</p>
        <h2>Real connection<br /><em>starts offline.</em></h2>
        <p>Coffee, music, stories, and a little curiosity. Stay for a drink. Leave knowing someone better.</p>
      </section>
    </main>
  );
}
