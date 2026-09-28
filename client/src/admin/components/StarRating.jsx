export default function StarRating({ value }) {
  return (
    <>
      {[1, 2, 3, 4, 5].map((i) => (
        <i key={i} className="fa-solid fa-star" style={{ color: i <= value ? "#F5B921" : "#E3E9F5" }}></i>
      ))}
    </>
  );
}
