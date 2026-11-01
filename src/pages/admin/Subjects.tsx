import CatalogManager from "../../components/CatalogManager"

export default function Subjects() {
  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Subjects and grades</h1>
      <p className="mt-1 text-mute">
        The categories students use when they list and search for books
      </p>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <CatalogManager
          title="Subjects"
          hint="Each subject has its own book colour."
          endpoint="subjects"
        />
        <CatalogManager
          title="Grade levels"
          hint="Shown as filters on the Browse page."
          endpoint="grade-levels"
        />
      </div>
    </div>
  )
}
