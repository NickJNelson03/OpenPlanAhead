import { useState } from "react";

export default function App() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const search = async () => {
    const res = await fetch(`http://localhost:5000/search?q=${query}`);
    const data = await res.json();
    setResults(data.results);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Course Search</h1>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search courses..."
      />

      <button onClick={search}>Search</button>

      <div style={{ marginTop: 20 }}>
        {results.map((c, i) => (
          <div key={i} style={{ marginBottom: 15 }}>
            <strong>
              {c.subject} {c.course_number}
            </strong>{" "}
            - {c.title}
            <br />
            {c.days} {c.start_time}-{c.end_time}
            <br />
            Instructor: {c.instructor}
          </div>
        ))}
      </div>
    </div>
  );
}