import { ethers } from "ethers";
import { GELATO_API, FACTORY_ADDRESS } from "./constants";
import { GelatoRelay, SponsoredCallRequest } from "@gelatonetwork/relay-sdk";
import { poll, jetch } from "./helper";
import factoryAbi from "./abi/factory.json";

enum TaskState {
  Success = "ExecSuccess",
  Cancelled = "Cancelled",
}

interface TaskStatus {
  task: {
    taskState: TaskState;
  };
}

interface BatchDeployResponse {
  [chainId: number]: string | null;
}

const deploy = async (
  bytecode: string,
  salt: string,
  chainId: number,
  sponsorApiKey: string
): Promise<string | null> => {
  const factory = new ethers.utils.Interface(factoryAbi);
  const data = factory.encodeFunctionData("deploy", [bytecode, salt]);

  const relay = new GelatoRelay();

  const request: SponsoredCallRequest = {
    chainId: chainId,
    target: FACTORY_ADDRESS,
    data: data,
  };

  const { taskId } = await relay.sponsoredCall(request, sponsorApiKey, {
    retries: 0,
  });

  const { task } = await poll<TaskStatus>(
    () => jetch(GELATO_API + "/tasks/status/" + taskId),
    ({ task }) =>
      task.taskState === TaskState.Success ||
      task.taskState === TaskState.Cancelled,
    1000
  );

  return task.taskState === TaskState.Success
    ? computeAddress(bytecode, salt)
    : null;
};

const batchDeploy = async (
  bytecode: string,
  salt: string,
  chainIds: number[],
  sponsorApiKey: string
): Promise<BatchDeployResponse> => {
  const contracts = await Promise.all(
    chainIds.map((chainId) => deploy(bytecode, salt, chainId, sponsorApiKey))
  );

  return contracts.reduce((prev, cur, idx) => {
    prev[chainIds[idx]] = cur;
    return prev;
  }, <BatchDeployResponse>{});
};

const computeAddress = (bytecode: string, salt: string): string => {
  return ethers.utils.getCreate2Address(
    FACTORY_ADDRESS,
    salt,
    ethers.utils.solidityKeccak256(["bytes"], [bytecode])
  );
};

export { batchDeploy, computeAddress };
