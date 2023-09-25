<!-- ChatWindow.svelte -->
<script lang="ts">
	import type { Message } from "$lib/types/Message";
	import { createEventDispatcher } from "svelte";
	import CarbonSendAltFilled from "~icons/carbon/send-alt-filled";
	import CarbonExport from "~icons/carbon/export";
	import CarbonStopFilledAlt from "~icons/carbon/stop-filled-alt";
	import EosIconsLoading from "~icons/eos-icons/loading";
	import ChatMessages from "./ChatMessages.svelte";
	import ChatInput from "./ChatInput.svelte";
	import StopGeneratingBtn from "../StopGeneratingBtn.svelte";
	import type { Model } from "$lib/types/Model";
	import type { LayoutData } from "../../../routes/$types";
	import WebSearchToggle from "../WebSearchToggle.svelte";
	import type { WebSearchMessage } from "$lib/types/WebSearch";
	import LoginModal from "../LoginModal.svelte";
	import UploadButton from "./UploadButton.svelte";

	export let messages: Message[] = [];
	export let loading = false;
	export let pending = false;
	export let shared = false;
	export let currentModel: Model;
	export let models: Model[];
	export let settings: LayoutData["settings"];
	export let webSearchMessages: WebSearchMessage[] = [];
	export let searches: Record<string, WebSearchMessage[]> = {};

	export let loginRequired = false;
	$: isReadOnly = !models.some((model) => model.id === currentModel.id);

	let loginModalOpen = false;
	let message: string;

	const dispatch = createEventDispatcher<{
		message: string;
		share: void;
		stop: void;
		retry: { id: Message["id"]; content: string };
	}>();

	const handleSubmit = () => {
		if (loading) return;
		dispatch("message", message);
		message = "";
	};

	// Define a new state variable for controlling the visibility of the document table
	let showDocumentTable = false;

	// Document data structure
	let documentData: { name: string; date: string }[] = [];

	// Function to toggle the visibility of the document table
	function toggleDocumentTableVisibility(): void {
		showDocumentTable = !showDocumentTable;
	}

	// Function to delete a document by its index
	function deleteDocument(index: number): void {
		documentData.splice(index, 1);
		// Trigger reactivity by updating the documentData array
		documentData = [...documentData];
	}

	// Function to add a new document
	function addDocument(event: CustomEvent<{ name: string; date: string }>): void {
		// Extract data from the CustomEvent
		const { name, date } = event.detail;

		// Check if a document with the same name already exists
		const isDuplicate = documentData.some((document) => document.name === name);

		// If it's not a duplicate, add the new document
		if (!isDuplicate) {
			// Create a new document object
			const newDocument = { name, date };

			// Add the new document to the documentData array
			documentData = [...documentData, newDocument];
		}
	}

	// Event handler for the "documentUploaded" event from the UploadButton
	function handleDocumentUploaded(event: CustomEvent<{ name: string; date: string }>): void {
		// Add the uploaded document to the documentData array
		addDocument(event);
	}
</script>

<div class="relative flex min-h-0 min-w-0 items-center justify-center">
	{#if loginModalOpen}
		<LoginModal {settings} on:close={() => (loginModalOpen = false)} />
	{/if}
	<ChatMessages
		{loading}
		{pending}
		{settings}
		{currentModel}
		{models}
		{messages}
		readOnly={isReadOnly}
		isAuthor={!shared}
		{webSearchMessages}
		{searches}
		on:message
		on:vote
		on:retry={(ev) => {
			if (!loading) dispatch("retry", ev.detail);
		}}
	/>
	<div
		class="dark:via-gray-80 pointer-events-none absolute inset-x-0 bottom-0 z-0 mx-auto flex w-full max-w-3xl flex-col items-center justify-center bg-gradient-to-t from-white via-white/80 to-white/0 px-3.5 py-4 dark:border-gray-800 dark:from-gray-900 dark:to-gray-900/0 max-md:border-t max-md:bg-white max-md:dark:bg-gray-900 sm:px-5 md:py-8 xl:max-w-4xl [&>*]:pointer-events-auto"
	>
		<div class="flex w-full pb-3 max-md:justify-between">
			{#if settings?.searchEnabled}
				<WebSearchToggle />
			{/if}
			{#if loading}
				<StopGeneratingBtn
					classNames={settings?.searchEnabled ? "md:-translate-x-1/2 md:mx-auto" : "mx-auto"}
					on:click={() => dispatch("stop")}
				/>
			{/if}
		</div>
		<form
			on:submit|preventDefault={handleSubmit}
			class="relative flex w-full max-w-4xl flex-1 items-center rounded-xl border bg-gray-100 focus-within:border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:focus-within:border-gray-500 {isReadOnly
				? 'opacity-30'
				: ''}"
		>
			<div class="flex w-full flex-1 border-none bg-transparent">
				<ChatInput
					placeholder="Ask anything"
					bind:value={message}
					on:submit={handleSubmit}
					on:keypress={() => {
						if (loginRequired) loginModalOpen = true;
					}}
					maxRows={4}
					disabled={isReadOnly}
				/>
				{#if loading}
					<button
						class="btn mx-1 my-1 inline-block h-[2.4rem] self-end rounded-lg bg-transparent p-1 px-[0.7rem] text-gray-400 disabled:opacity-60 enabled:hover:text-gray-700 dark:disabled:opacity-40 enabled:dark:hover:text-gray-100 md:hidden"
						on:click={() => dispatch("stop")}
					>
						<CarbonStopFilledAlt />
					</button>
					<div
						class="mx-1 my-1 hidden h-[2.4rem] items-center p-1 px-[0.7rem] text-gray-400 disabled:opacity-60 enabled:hover:text-gray-700 dark:disabled:opacity-40 enabled:dark:hover:text-gray-100 md:flex"
					>
						<EosIconsLoading />
					</div>
				{:else}
					<button
						class="btn mx-1 my-1 h-[2.4rem] self-end rounded-lg bg-transparent p-1 px-[0.7rem] text-gray-400 disabled:opacity-60 enabled:hover:text-gray-700 dark:disabled:opacity-40 enabled:dark:hover:text-gray-100"
						disabled={!message || isReadOnly}
						type="submit"
					>
						<CarbonSendAltFilled />
					</button>
				{/if}
			</div>
		</form>

		<!-- Button to toggle the table -->
		<button on:click={toggleDocumentTableVisibility}>Document</button>
	</div>

	<!-- Document table (conditionally rendered) -->
	{#if showDocumentTable}
		<div class="top-30 absolute left-0 right-0">
			<div class="mb-2 ml-44">
				<UploadButton on:documentUploaded={handleDocumentUploaded} />
			</div>
			<div class="document-table mx-auto flex max-w-4xl flex-col rounded-lg bg-white p-1 shadow-lg">
				<table class="w-full table-auto">
					<thead>
						<tr>
							<th class="px-28 py-2">Doc</th>
							<th class="px-28 py-2">Date</th>
							<th class="px-28 py-2">Delete</th>
						</tr>
					</thead>
					<tbody>
						{#if documentData.length === 0}
							<tr>
								<td colspan="3" class="py-4 text-center"> No data available in the table </td>
							</tr>
						{:else}
							{#each documentData as document, index (document.name)}
								<tr>
									<td class="border px-3 py-2">{document.name}</td>
									<td class="border px-3 py-2">{document.date}</td>
									<td class="border px-3 py-2">
										<button on:click={() => deleteDocument(index)}>Delete</button>
									</td>
								</tr>
							{/each}
						{/if}
					</tbody>
				</table>
			</div>
		</div>
	{/if}
	<!-- End of Document table --><!-- End of Document table -->
</div>

<style>
	/* Your CSS styles here */
</style>
