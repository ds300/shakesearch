/** @jsx jsx */
import { jsx } from "@emotion/react"
import { parse, stringify } from "qs"
import { useLocation, Link } from "react-router-dom"
import { superLightGrey } from "../colors"
import { CaretIcon } from "../Icons/CaretIcon"

export const PageNavigation: React.FC<{
  pageIndex: number
  numPages: number
}> = ({ pageIndex, numPages }) => {
  return (
    <div
      css={{
        position: "relative",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        fontSize: 14,
        paddingTop: 40,
      }}
    >
      <div>
        {pageIndex > 0 && (
          <PaginationButton targetPageIndex={pageIndex - 1}>
            <CaretIcon direction="left" topOffset={3} leftOffset={-3} />{" "}
            Previous
          </PaginationButton>
        )}
      </div>
      <div
        style={{
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
        }}
      >
        Page {pageIndex + 1} of {numPages}
      </div>
      <div>
        {pageIndex < numPages - 1 && (
          <PaginationButton targetPageIndex={pageIndex + 1}>
            Next <CaretIcon topOffset={3} leftOffset={3} />
          </PaginationButton>
        )}
      </div>
    </div>
  )
}

const PaginationButton: React.FC<{ targetPageIndex: number }> = ({
  targetPageIndex,
  children,
}) => {
  const location = useLocation()
  const currentQuery = parse(location.search.slice(1))
  const hash = location.hash

  const url =
    location.pathname +
    "?" +
    stringify({ ...currentQuery, page: targetPageIndex + 1 }) +
    hash
  return (
    <Link
      css={{
        borderRadius: 6,
        padding: "10px 20px",
        margin: "0px -20px",
        ":hover": {
          backgroundColor: superLightGrey,
        },
      }}
      to={url}
    >
      {children}
    </Link>
  )
}
