import {
  useLoaderData,
  useFetcher,
  // useActionData,
  useRevalidator,
  useNavigate,
} from "react-router-dom";
import { useState, useEffect } from "react";
import { Table } from "@radix-ui/themes";

const TenantAdmin = () => {
  const [changedVacAlloc, setChangedVacAlloc] = useState({});
  // console.log("changedVacAlloc", changedVacAlloc);
  const { allDomainUsers } = useLoaderData();
  // console.log("allDomainUsers", allDomainUsers);
  const fetcher = useFetcher();
  // console.log("fetcher.data", fetcher.data);
  const navigate = useNavigate();

  const changedVacAllocValues = Object.values(changedVacAlloc);
  const hasChanged = changedVacAllocValues.length > 0;

  useEffect(() => {
    document.querySelectorAll(".vacDaysInput").forEach((i) => {
      i.addEventListener("keypress", function (e) {
        e.preventDefault(); // Prevent typing
      });
    });
    document.querySelectorAll(".vacDaysInput").forEach((i) => {
      i.addEventListener("paste", function (e) {
        e.preventDefault(); // Prevent pasting
      });
    });
    if (fetcher.state === "idle" && fetcher.data) {
      // revalidator.revalidate();
      // window.location.reload();
      navigate(0);
      fetcher.data = null;
    }
  }, [allDomainUsers, fetcher.data]);

  const tenantTableRow = allDomainUsers?.map((u) => (
    <Table.Row key={u._id}>
      <Table.RowHeaderCell>{u.email}</Table.RowHeaderCell>
      <Table.Cell>
        <input
          type="number"
          min="1"
          step="1"
          name={u._id}
          defaultValue={u.vacationAllocation}
          value={changedVacAlloc[u.id]}
          onChange={(e) => {
            const newObj = {
              ...changedVacAlloc,
              [e.target.name]: e.target.value,
            };
            setChangedVacAlloc(newObj);
          }}
          className={`${
            changedVacAlloc[u._id] ? "bg-red-400" : ""
          } vacDaysInput`}
        />
      </Table.Cell>
    </Table.Row>
  ));

  return (
    <>
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>Email</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Vacation allocation</Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>{tenantTableRow}</Table.Body>
      </Table.Root>
      {hasChanged && (
        <div className="flex justify-end">
          <button
            onClick={() => {
              fetcher.submit(
                { ...changedVacAlloc, intent: "vacAllocUpdate" },
                {
                  method: "PATCH",
                  // action: "/admin",
                }
              );
            }}
            className=""
          >
            save
          </button>
        </div>
      )}
    </>
  );
};

export default TenantAdmin;
