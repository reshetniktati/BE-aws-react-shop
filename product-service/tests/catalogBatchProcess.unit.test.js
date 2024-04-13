const AWS = require("aws-sdk");
const AWSMock = require("aws-sdk-mock");
const { catalogBatchProcess } = require("./handler");

AWSMock.setSDKInstance(AWS);

describe("catalogBatchProcess Lambda Function", () => {
  beforeAll(() => {
    AWSMock.mock("SNS", "publish", (params, callback) => {
      callback(null, { MessageId: "12345" });
    });
    // Mock other AWS services like DynamoDB if needed
  });

  afterAll(() => {
    AWSMock.restore("SNS");
    // Restore other AWS services if they were mocked
  });

  it("should process products and publish messages to SNS", async () => {
    const event = {
      Records: [
        { body: JSON.stringify({ id: "1", title: "Product 1" }) },
        { body: JSON.stringify({ id: "2", title: "Product 2" }) },
      ],
    };

    await catalogBatchProcess(event);

    // Assertions to ensure that SNS publish was called
    const publishCalls = AWSMock.mocked("SNS", "publish").mock.calls;
    expect(publishCalls.length).toBe(2);
    expect(publishCalls[0][0].Message).toContain("Product 1");
    expect(publishCalls[1][0].Message).toContain("Product 2");
  });

  it("should handle errors if SNS publish fails", async () => {
    AWSMock.remock("SNS", "publish", (params, callback) => {
      callback(new Error("Failed to publish message"));
    });

    const event = {
      Records: [{ body: JSON.stringify({ id: "1", title: "Product 1" }) }],
    };

    await expect(catalogBatchProcess(event)).rejects.toThrow(
      "Failed to publish message"
    );
  });
});
